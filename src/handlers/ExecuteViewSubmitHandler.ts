import {
	IUIKitResponse,
	IUIKitSurface,
	UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { sendNotification } from '../helper/notification';
import { CreateModalEnum } from '../enum/modals/createModal';
import { ReplyStorage } from '../storage/ReplyStorage';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { UserPreferenceStorage } from '../storage/userPreferenceStorage';
import {
	getUserPreferredLanguage,
	isSupportedLanguage,
} from '../helper/userPreference';
import { SetUserPreferenceModalEnum } from '../enum/modals/setUserPreferenceModal';
import { Language, t } from '../lib/Translation/translation';
import { SendModalEnum } from '../enum/modals/sendModal';
import { sendMessage } from '../helper/message';
import { CacheReplyStorage } from '../storage/ReplyCache';
import { IReply } from '../definition/reply/IReply';
import { listReplyContextualBar } from '../modal/listContextualBar';
import { ConfirmDeleteModalEnum } from '../enum/modals/confirmDeleteModal';
import { EditModalEnum } from '../enum/modals/editModal';

export class ExecuteViewSubmitHandler {
	private context: UIKitViewSubmitInteractionContext;

	constructor(
		protected readonly app: QuickRepliesApp,
		protected readonly read: IRead,
		protected readonly http: IHttp,
		protected readonly persistence: IPersistence,
		protected readonly modify: IModify,
		context: UIKitViewSubmitInteractionContext,
	) {
		this.context = context;
	}

	public async handleActions(): Promise<IUIKitResponse> {
		const { view, user } = this.context.getInteractionData();
		const persistenceRead = this.read.getPersistenceReader();
		const roomInteractionStorage = new RoomInteractionStorage(
			this.persistence,
			persistenceRead,
			user.id,
		);
		const roomId = await roomInteractionStorage.getInteractionRoomId();
		const room = (await this.read.getRoomReader().getById(roomId)) as IRoom;
		const language = await getUserPreferredLanguage(
			this.app,
			this.read.getPersistenceReader(),
			this.persistence,
			user.id,
		);

		switch (view.id) {
			case CreateModalEnum.VIEW_ID:
				return this.handleCreate(room, user, view, language);
			case SetUserPreferenceModalEnum.VIEW_ID:
				return this.handleSetUserPreference(room, user, view);
			case SendModalEnum.VIEW_ID:
				return this.handleSend(room, user, view);
			case ConfirmDeleteModalEnum.VIEW_ID:
				return this.handleDelete(room, user, view, language);
			case EditModalEnum.VIEW_ID:
				return this.handleEdit(room, user, view, language);
			default:
				return this.context.getInteractionResponder().successResponse();
		}
	}

	private async handleCreate(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
		language: Language,
	): Promise<IUIKitResponse> {
		const nameStateValue =
			view.state?.[CreateModalEnum.REPLY_NAME_BLOCK_ID]?.[
				CreateModalEnum.REPLY_NAME_ACTION_ID
			];
		const bodyStateValue =
			view.state?.[CreateModalEnum.REPLY_BODY_BLOCK_ID]?.[
				CreateModalEnum.REPLY_BODY_ACTION_ID
			];

		if (!nameStateValue || !bodyStateValue) {
			const errorMessage = `${t('Error_Fill_Required_Fields', language)}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});
			return this.context.getInteractionResponder().errorResponse();
		}

		const name = nameStateValue.trim();
		const body = bodyStateValue.trim();
		const replyStorage = new ReplyStorage(
			this.persistence,
			this.read.getPersistenceReader(),
		);
		const result = await replyStorage.createReply(
			user,
			name,
			body,
			language,
		);

		if (result.success) {
			const successMessage = `${t('Success_Create_Reply', language, {
				name: user.name,
				replyname: name,
			})}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: successMessage,
			});

			const userReplies: IReply[] = await replyStorage.getReplyForUser(
				user,
			);
			const UpdatedListBar = await listReplyContextualBar(
				this.app,
				user,
				this.read,
				this.persistence,
				this.modify,
				room,
				userReplies,
				language,
			);
			return this.context
				.getInteractionResponder()
				.updateModalViewResponse(UpdatedListBar);
		} else {
			const errorMessage = `${t('Fail_Create_Reply', language, {
				name: user.name,
			})} \n\n ${result.error}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});

			return this.context.getInteractionResponder().errorResponse();
		}
	}

	private async handleSetUserPreference(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
	): Promise<IUIKitResponse> {
		const languageInput =
			view.state?.[
				SetUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_BLOCK_ID
			]?.[SetUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_ACTION_ID];

		if (!languageInput || !isSupportedLanguage(languageInput)) {
			return this.context.getInteractionResponder().errorResponse();
		}

		const userPreference = new UserPreferenceStorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);
		await userPreference.storeUserPreference({
			userId: user.id,
			language: languageInput,
		});

		return this.context.getInteractionResponder().successResponse();
	}

	private async handleSend(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
	): Promise<IUIKitResponse> {
		try {
			let body = '';

			const replyCacheStorage = new CacheReplyStorage(
				this.persistence,
				this.read.getPersistenceReader(),
			);
			const cachedReply = await replyCacheStorage.getCacheReply(user);
			const bodyStateValue = view.state?.[
				SendModalEnum.REPLY_BODY_BLOCK_ID
			]?.[SendModalEnum.REPLY_BODY_ACTION_ID] as string;

			console.log(bodyStateValue);

			body = bodyStateValue ? bodyStateValue : cachedReply.body;

			const message = body.trim();
			if (!message) {
				return this.context.getInteractionResponder().errorResponse();
			}

			await sendMessage(this.modify, user, room, body);
			await replyCacheStorage.removeCacheReply(user);
			return this.context.getInteractionResponder().successResponse();
		} catch (error) {
			console.error('Error handling send:', error);
			return this.context.getInteractionResponder().errorResponse();
		}
	}

	private async handleDelete(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
		language: Language,
	): Promise<IUIKitResponse> {
		console.log('deleteHanler ');
		const persistenceRead = this.read.getPersistenceReader();
		const replyStorage = new ReplyStorage(
			this.persistence,
			persistenceRead,
		);

		const replyCacheStorage = new CacheReplyStorage(
			this.persistence,
			this.read.getPersistenceReader(),
		);
		const cachedReply = await replyCacheStorage.getCacheReply(user);
		console.log(cachedReply);

		const replyId = cachedReply.id;
		const result = await replyStorage.deleteReplyById(
			user,
			replyId,
			language,
		);

		if (result.success) {
			const successMessage = `${t('Deleted_Successfully', language, {
				replyname: cachedReply.name,
			})}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: successMessage,
			});
			await replyCacheStorage.removeCacheReply(user);
			const userReplies: IReply[] = await replyStorage.getReplyForUser(
				user,
			);

			const UpdatedListBar = await listReplyContextualBar(
				this.app,
				user,
				this.read,
				this.persistence,
				this.modify,
				room,
				userReplies,
				language,
			);
			return this.context
				.getInteractionResponder()
				.updateModalViewResponse(UpdatedListBar);
		} else {
			const errorMessage = `${t('Fail_Delete_Reply', language)} \n\n ${
				result.error
			}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});
			return this.context.getInteractionResponder().errorResponse();
		}
	}

	private async handleEdit(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
		language,
	): Promise<IUIKitResponse> {
		const persistenceRead = this.read.getPersistenceReader();
		const replyStorage = new ReplyStorage(
			this.persistence,
			persistenceRead,
		);

		const replyCacheStorage = new CacheReplyStorage(
			this.persistence,
			this.read.getPersistenceReader(),
		);

		const cachedReply = await replyCacheStorage.getCacheReply(user);

		const nameStateValue =
			view.state?.[EditModalEnum.REPLY_NAME_BLOCK_ID]?.[
				EditModalEnum.REPLY_NAME_ACTION_ID
			];
		const bodyStateValue =
			view.state?.[EditModalEnum.REPLY_BODY_BLOCK_ID]?.[
				EditModalEnum.REPLY_BODY_ACTION_ID
			];

		console.log(nameStateValue, cachedReply.name, view.state);

		const name = nameStateValue ? nameStateValue.trim() : cachedReply.name;
		const body = bodyStateValue ? bodyStateValue.trim() : cachedReply.body;

		const result = await replyStorage.updateReplyById(
			user,
			cachedReply.id,
			name,
			body,
			language,
		);

		if (result.success) {
			const successMessage = `${t('Edited_Sucessfully', language, {
				replyname: cachedReply.name,
			})} `;

			await sendNotification(this.read, this.modify, user, room, {
				message: successMessage,
			});

			await replyCacheStorage.removeCacheReply(user);
			const userReplies: IReply[] = await replyStorage.getReplyForUser(
				user,
			);

			const UpdatedListBar = await listReplyContextualBar(
				this.app,
				user,
				this.read,
				this.persistence,
				this.modify,
				room,
				userReplies,
				language,
			);
			return this.context
				.getInteractionResponder()
				.updateModalViewResponse(UpdatedListBar);
		} else {
			const errorMessage = `${t('Fail_Edit_Reply', language, {
				replyname: cachedReply.name,
			})}
            \n\n${result.error}`;

			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});
			return this.context.getInteractionResponder().errorResponse();
		}
	}
}
