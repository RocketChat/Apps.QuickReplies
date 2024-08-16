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
import { getUserPreferredLanguage } from '../helper/userPreference';
import { UserPreferenceModalEnum } from '../enum/modals/UserPreferenceModal';
import { Language, t } from '../lib/Translation/translation';
import { SendModalEnum } from '../enum/modals/sendModal';
import {
	getReplacementValues,
	replacePlaceholders,
	sendMessage,
} from '../helper/message';
import { ConfirmDeleteModalEnum } from '../enum/modals/confirmDeleteModal';
import { EditModalEnum } from '../enum/modals/editModal';
import { ReplyAIModalEnum } from '../enum/modals/AIreplyModal';
import { AIstorage } from '../storage/AIStorage';
import { AIusagePreference } from '../definition/helper/userPreference';
import { listReplyContextualBar } from '../modal/listContextualBar';
import { Receiverstorage } from '../storage/ReceiverStorage';

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
		const { view, user, triggerId } = this.context.getInteractionData();
		const persistenceRead = this.read.getPersistenceReader();
		const roomInteractionStorage = new RoomInteractionStorage(
			this.persistence,
			persistenceRead,
			user.id,
		);
		const roomId = await roomInteractionStorage.getInteractionRoomId();
		const room = (await this.read.getRoomReader().getById(roomId)) as IRoom;
		const language = await getUserPreferredLanguage(
			this.read.getPersistenceReader(),
			this.persistence,
			user.id,
		);

		const ViewData = view.id.split('---');
		const ViewLegnth = ViewData.length;
		const viewId = ViewData[0].trim();

		if (ViewLegnth === 1) {
			switch (viewId) {
				case UserPreferenceModalEnum.VIEW_ID:
					return this.handleSetUserPreference(room, user, view);
				case CreateModalEnum.VIEW_ID:
					return this.handleCreate(
						room,
						user,
						view,
						language,
						triggerId,
					);
				case ReplyAIModalEnum.VIEW_ID:
					return this.handleAIresponse(room, user, view, language);
			}
		} else if (ViewLegnth === 2) {
			const replyId = ViewData[1].trim();

			switch (viewId) {
				case SendModalEnum.VIEW_ID:
					return this.handleSend(room, user, view, replyId);
				case ConfirmDeleteModalEnum.VIEW_ID:
					return this.handleDelete(
						room,
						user,
						view,
						language,
						replyId,
						triggerId,
					);
				case EditModalEnum.VIEW_ID:
					return this.handleEdit(
						room,
						user,
						view,
						language,
						replyId,
						triggerId,
					);
			}
		}
		return this.context.getInteractionResponder().errorResponse();
	}
	private async handleCreate(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
		language: Language,
		triggerId: string,
	): Promise<IUIKitResponse> {
		const nameStateValue =
			view.state?.[CreateModalEnum.REPLY_NAME_BLOCK_ID]?.[
				CreateModalEnum.REPLY_NAME_ACTION_ID
			];
		const bodyStateValue =
			view.state?.[CreateModalEnum.REPLY_BODY_BLOCK_ID]?.[
				CreateModalEnum.REPLY_BODY_ACTION_ID
			];

		const name = nameStateValue ? nameStateValue.trim() : '';
		const body = bodyStateValue ? bodyStateValue.trim() : '';
		if (!name || !body) {
			const errorMessage = `${t('Error_Fill_Required_Fields', language)}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});
			return this.context.getInteractionResponder().errorResponse();
		}

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
			this.updateList(user, room, language, triggerId);
			return this.context.getInteractionResponder().successResponse();
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
		const languageInput = view.state?.[
			UserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_BLOCK_ID
		]?.[
			UserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_ACTION_ID
		] as Language;

		const AIpreferenceInput = view.state?.[
			UserPreferenceModalEnum.AI_PREFERENCE_DROPDOWN_BLOCK_ID
		]?.[
			UserPreferenceModalEnum.AI_PREFERENCE_DROPDOWN_ACTION_ID
		] as AIusagePreference;

		const AIoptionInput =
			view.state?.[UserPreferenceModalEnum.AI_OPTION_DROPDOWN_BLOCK_ID]?.[
				UserPreferenceModalEnum.AI_OPTION_DROPDOWN_ACTION_ID
			];

		const OpenAIAPIKeyInput =
			view.state?.[UserPreferenceModalEnum.OPEN_AI_API_KEY_BLOCK_ID]?.[
				UserPreferenceModalEnum.OPEN_AI_API_KEY_ACTION_ID
			];
		const OpenAImodelInput =
			view.state?.[UserPreferenceModalEnum.OPEN_AI_MODEL_BLOCK_ID]?.[
				UserPreferenceModalEnum.OPEN_AI_MODEL_ACTION_ID
			];
		const GeminiAPIKeyInput =
			view.state?.[UserPreferenceModalEnum.GEMINI_API_KEY_BLOCK_ID]?.[
				UserPreferenceModalEnum.GEMINI_API_KEY_ACTION_ID
			];
		const SelfHostedURLInput =
			view.state?.[UserPreferenceModalEnum.SELF_HOSTED_URL_BLOCK_ID]?.[
				UserPreferenceModalEnum.SELF_HOSTED_URL_ACTION_ID
			];

		const PromptConfigurationInput =
			view.state?.[
				UserPreferenceModalEnum.PROMPT_CONFIG_INPUT_BLOCK_ID
			]?.[UserPreferenceModalEnum.PROMPT_CONFIG_INPUT_ACTION_ID];

		const userPreference = new UserPreferenceStorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);

		await userPreference.storeUserPreference({
			userId: user.id,
			language: languageInput,
			AIusagePreference: AIpreferenceInput,
			AIconfiguration: {
				AIPrompt: PromptConfigurationInput,
				AIProvider: AIoptionInput,
				openAI: {
					apiKey: OpenAIAPIKeyInput,
					model: OpenAImodelInput,
				},
				gemini: {
					apiKey: GeminiAPIKeyInput,
				},
				selfHosted: {
					url: SelfHostedURLInput,
				},
			},
		});

		await sendNotification(this.read, this.modify, user, room, {
			message: t('Config_Updated_Successfully', languageInput),
		});

		return this.context.getInteractionResponder().successResponse();
	}

	private async handleSend(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
		replyId: string,
	): Promise<IUIKitResponse> {
		try {
			const replyStorage = new ReplyStorage(
				this.persistence,
				this.read.getPersistenceReader(),
			);
			const storedReply = await replyStorage.getReplyById(user, replyId);

			const bodyStateValue = view.state?.[
				SendModalEnum.REPLY_BODY_BLOCK_ID
			]?.[SendModalEnum.REPLY_BODY_ACTION_ID] as string;

			const ReceiverStorage = new Receiverstorage(
				this.persistence,
				this.read.getPersistenceReader(),
				user.id,
			);

			const receiverInfo = await ReceiverStorage.getReceiverRecord();

			let Placeholders = {};
			if (receiverInfo) {
				Placeholders = receiverInfo;
			} else {
				Placeholders = await getReplacementValues(
					room,
					user,
					this.read,
				);
			}
			if (storedReply) {
				const updateStoredMessage = replacePlaceholders(
					storedReply?.body,
					Placeholders,
				);

				const message = bodyStateValue
					? bodyStateValue
					: storedReply
					? updateStoredMessage
					: '';

				if (!message) {
					return this.context
						.getInteractionResponder()
						.errorResponse();
				}

				await sendMessage(this.modify, user, room, message);
				return this.context.getInteractionResponder().successResponse();
			} else {
				return this.context.getInteractionResponder().errorResponse();
			}
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
		replyId: string,
		triggerId: string,
	): Promise<IUIKitResponse> {
		const persistenceRead = this.read.getPersistenceReader();
		const replyStorage = new ReplyStorage(
			this.persistence,
			persistenceRead,
		);

		const reply = await replyStorage.getReplyById(user, replyId);

		if (!reply) {
			return this.context.getInteractionResponder().errorResponse();
		}

		const result = await replyStorage.deleteReplyById(
			user,
			replyId,
			language,
		);

		if (result.success) {
			const successMessage = `${t('Deleted_Successfully', language, {
				replyname: reply.name,
			})}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: successMessage,
			});
			this.updateList(user, room, language, triggerId);

			return this.context.getInteractionResponder().successResponse();
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
		replyId: string,
		triggerId: string,
	): Promise<IUIKitResponse> {
		const persistenceRead = this.read.getPersistenceReader();
		const replyStorage = new ReplyStorage(
			this.persistence,
			persistenceRead,
		);

		const storedReply = await replyStorage.getReplyById(user, replyId);
		const nameStateValue =
			view.state?.[EditModalEnum.REPLY_NAME_BLOCK_ID]?.[
				EditModalEnum.REPLY_NAME_ACTION_ID
			];

		const bodyStateValue =
			view.state?.[EditModalEnum.REPLY_BODY_BLOCK_ID]?.[
				EditModalEnum.REPLY_BODY_ACTION_ID
			];

		const name = nameStateValue
			? nameStateValue.trim()
			: storedReply
			? storedReply.name.trim()
			: '';

		const body = bodyStateValue
			? bodyStateValue.trim()
			: storedReply
			? storedReply.body.trim()
			: '';

		const result = await replyStorage.updateReplyById(
			user,
			replyId,
			name,
			body,
			language,
		);

		if (result.success) {
			const successMessage = `${t('Edited_Sucessfully', language, {
				replyname: storedReply?.name,
			})} `;

			await sendNotification(this.read, this.modify, user, room, {
				message: successMessage,
			});
			this.updateList(user, room, language, triggerId);

			return this.context.getInteractionResponder().successResponse();
		} else {
			const errorMessage = `${t('Fail_Edit_Reply', language, {
				replyname: storedReply?.name,
			})}
            \n\n${result.error}`;

			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});
			return this.context.getInteractionResponder().errorResponse();
		}
	}

	private async handleAIresponse(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
		language: Language,
	): Promise<IUIKitResponse> {
		const AIStorage = new AIstorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);

		const response = await AIStorage.getResponse();
		let message = '';
		const bodyStateValue =
			view.state?.[
				`${ReplyAIModalEnum.RESPONSE_BODY_BLOCK_ID} --- ${response}`
			]?.[`${ReplyAIModalEnum.RESPONSE_BODY_ACTION_ID} --- ${response}`];

		message = bodyStateValue ? bodyStateValue.trim() : response.trim();

		if (message === '') {
			await AIStorage.clearAIInteraction();
			return this.context.getInteractionResponder().errorResponse();
		}

		await sendMessage(this.modify, user, room, message);

		await AIStorage.clearAIInteraction();

		return this.context.getInteractionResponder().successResponse();
	}
	private async updateList(
		user: IUser,
		room: IRoom,
		language: Language,
		triggerId: string,
	) {
		const replyStorage = new ReplyStorage(
			this.persistence,
			this.read.getPersistenceReader(),
		);
		const userReplies = await replyStorage.getReplyForUser(user);
		const listbar = await listReplyContextualBar(
			this.app,
			user,
			this.read,
			this.persistence,
			this.modify,
			room,
			userReplies,
			language,
		);

		this.modify
			.getUiController()
			.updateSurfaceView(listbar, { triggerId: triggerId }, user);
	}
}
