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
import { CreateModalEnum } from '../enum/modals/CreateModal';
import { ReplyStorage } from '../storage/ReplyStorage';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { UserPreferenceStorage } from '../storage/userPreferenceStorage';
import {
	getUserPreferredLanguage,
	isSupportedLanguage,
} from '../helper/userPreference';
import { setUserPreferenceModalEnum } from '../enum/modals/setUserPreferenceModal';
import { Language, t } from '../lib/Translation/translation';

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
			case CreateModalEnum.VIEW_ID: {
				return this.handleCreate(room, user, view, language);
			}
			case setUserPreferenceModalEnum.VIEW_ID: {
				return this.handleSetUserPreference(room, user, view);
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}

	public async handleCreate(
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
			const errorMessage = `${t('hey', language)} ${user.name}, ${t(
				'fail_create_reply',
				language,
			)} ${t('quick_reply', language)}. ❌\n\n ${t(
				'error_fill_fields',
				language,
			)}`;

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

		const result = await replyStorage.createReply(user, name, body);

		if (result.success) {
			const successMessage = `${t('hey', language)} ${user.name},${t(
				'quick_reply',
				language,
			)} **${name}** ${t('created_successfully', language)} ✅`;
			await sendNotification(this.read, this.modify, user, room, {
				message: successMessage,
			});
			return this.context.getInteractionResponder().successResponse();
		} else {
			const errorMessage = `${t('hey', language)} ${user.name}, ${t(
				'fail_create_reply',
				language,
			)} ❌\n\n${t('error_fill_fields', language)}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});
			return this.context.getInteractionResponder().errorResponse();
		}
	}
	public async handleSetUserPreference(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
	): Promise<IUIKitResponse> {
		const LanguageInput =
			view.state?.[
				setUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_BLOCK_ID
			]?.[setUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_ACTION_ID];

		if (!LanguageInput) {
			return this.context.getInteractionResponder().errorResponse();
		}

		const userPreference = new UserPreferenceStorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);

		if (!isSupportedLanguage(LanguageInput)) {
			return this.context.getInteractionResponder().errorResponse();
		}
		await userPreference.storeUserPreference({
			userId: user.id,
			language: LanguageInput,
		});

		return this.context.getInteractionResponder().successResponse();
	}
}
