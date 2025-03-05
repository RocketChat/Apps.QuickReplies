import {
	IUIKitResponse,
	UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { ReplyStorage } from '../storage/ReplyStorage';
import { SendReplyModal } from '../modal/sendModal';
import { Handler } from './Handler';
import { MessageActionButton } from '../enum/notification';
import { ListContextualBarEnum } from '../enum/modals/listContextualBar';
import { getUserPreferredLanguage } from '../helper/userPreference';
import { confirmDeleteModal } from '../modal/confirmDeleteModal';
import { EditReplyModal } from '../modal/editModal';
import { listReplyContextualBar } from '../modal/listContextualBar';
import { ReplyAIModalEnum } from '../enum/modals/AIreplyModal';
import { AIstorage } from '../storage/AIStorage';
import { ReplyAIModal } from '../modal/AIreplyModal';
import AIHandler from './AIHandler';
import { UserPreferenceModal } from '../modal/UserPreferenceModal';
import {
	AIProviderEnum,
	AIusagePreferenceEnum,
} from '../definition/helper/userPreference';
import { UserPreferenceModalEnum } from '../enum/modals/UserPreferenceModal';
import { UserPreferenceStorage } from '../storage/userPreferenceStorage';

export class ExecuteBlockActionHandler {
	private context: UIKitBlockInteractionContext;
	constructor(
		protected readonly app: QuickRepliesApp,
		protected readonly read: IRead,
		protected readonly http: IHttp,
		protected readonly persistence: IPersistence,
		protected readonly modify: IModify,
		context: UIKitBlockInteractionContext,
	) {
		this.context = context;
	}

	public async handleActions(): Promise<IUIKitResponse> {
		const {
			actionId,
			user,
			container,
			blockId,
			value,
			triggerId,
			message,
		} = this.context.getInteractionData();
		let { room } = this.context.getInteractionData();
		const persistenceRead = this.read.getPersistenceReader();

		const roomInteractionStorage = new RoomInteractionStorage(
			this.persistence,
			persistenceRead,
			user.id,
		);

		const roomId = await roomInteractionStorage.getInteractionRoomId();
		const roomPersistance = await this.read.getRoomReader().getById(roomId);

		const userPreference = new UserPreferenceStorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);
		const existingPreference = await userPreference.getUserPreference();

		const language = await getUserPreferredLanguage(
			this.read.getPersistenceReader(),
			this.persistence,
			user.id,
		);
		const replyStorage = new ReplyStorage(
			this.persistence,
			persistenceRead,
		);
		const userReplies = await replyStorage.getReplyForUser(user);

		if (room === undefined) {
			if (roomPersistance) {
				room = roomPersistance;
			} else {
				console.error("Room doesn't exist");
				return this.context.getInteractionResponder().errorResponse();
			}
		}
		const handler = new Handler({
			app: this.app,
			sender: user,
			room: room,
			read: this.read,
			modify: this.modify,
			http: this.http,
			persis: this.persistence,
			triggerId,
			language,
		});

		switch (actionId) {
			case ListContextualBarEnum.REPLY_OVERFLOW_ACTIONID: {
				if (value) {
					const command = value.split(' : ')[0].trim();
					const replyId = value.split(' : ')[1].trim();

                    const replyStorage = new ReplyStorage(
                        this.persistence,
                        persistenceRead,
                    );

                    const reply = await replyStorage.getReplyById(
                        user,
                        replyId,
                    );

                    if (!reply) {
                        return this.context
                            .getInteractionResponder()
                            .errorResponse();
                    }
                    const language = await getUserPreferredLanguage(
                        this.read.getPersistenceReader(),
                        this.persistence,
                        user.id,
                    );
                    if (room) {
                        switch (command) {
                            case ListContextualBarEnum.SEND:
                                const sendModal = await SendReplyModal(
                                    this.app,
                                    user,
                                    this.read,
                                    this.persistence,
                                    this.modify,
                                    room,
                                    reply,
                                    language,
                                );
                                return this.context
                                    .getInteractionResponder()
                                    .openModalViewResponse(sendModal);
                            case ListContextualBarEnum.EDIT:
                                const editModal = await EditReplyModal(
                                    this.app,
                                    user,
                                    this.read,
                                    this.persistence,
                                    this.modify,
                                    room,
                                    reply,
                                    language,
                                );
                                return this.context
                                    .getInteractionResponder()
                                    .openModalViewResponse(editModal);
                            case ListContextualBarEnum.DELETE:
                                const confirmModal = await confirmDeleteModal(
                                    this.app,
                                    user,
                                    this.read,
                                    this.persistence,
                                    this.modify,
                                    room,
                                    reply,
                                    language,
                                );
                                return this.context
                                    .getInteractionResponder()
                                    .openModalViewResponse(confirmModal);
                            default:
                                break;
                        }
                    }
                }
                break;
            }
            case MessageActionButton.CREATE_REPLY_ACTION_ID: {
                await handler.CreateReply();
                break;
            }
            case MessageActionButton.LIST_REPLY_ACTION_ID: {
                await handler.ListReply();
                break;
            }
            case MessageActionButton.CONFIGURE_PREFERENCES_ACTION_ID:
                await handler.Configure();
                break;
            case MessageActionButton.NEED_MORE_ACTION_ID:
                await handler.Help();
                break;
            case ListContextualBarEnum.SEARCH_ACTION_ID:
                if (value) {
                    const UpdatedListBar = await listReplyContextualBar(
                        this.app,
                        user,
                        this.read,
                        this.persistence,
                        this.modify,
                        room,
                        userReplies,
                        language,
                        value,
                    );
                    return this.context
                        .getInteractionResponder()
                        .updateContextualBarViewResponse(UpdatedListBar);
                } else {
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
                        .updateContextualBarViewResponse(UpdatedListBar);
                }
            case ReplyAIModalEnum.PROMPT_INPUT_ACTION_ID:
                const aistorage = new AIstorage(
                    this.persistence,
                    this.read.getPersistenceReader(),
                    user.id,
                );
                if (value) {
                    await aistorage.updatePrompt(value);
                }
                break;
            case ReplyAIModalEnum.GENERATE_BUTTON_ACTION_ID:
                const aiStorage = new AIstorage(
                    this.persistence,
                    this.read.getPersistenceReader(),
                    user.id,
                );
                const message = await aiStorage.getMessage();
                const prompt = await aiStorage.getPrompt();

                const Preference = await userPreference.getUserPreference();

				const response = await new AIHandler(
					this.app,
					this.http,
					Preference,
				).handleResponse(user, message, prompt);

                await aiStorage.updateResponse(response);

                const updatedModal = await ReplyAIModal(
                    this.app,
                    user,
                    this.read,
                    this.persistence,
                    this.modify,
                    room,
                    language,
                    message,
                    response,
                );

                return this.context
                    .getInteractionResponder()
                    .updateModalViewResponse(updatedModal);
            case UserPreferenceModalEnum.AI_PREFERENCE_DROPDOWN_ACTION_ID:
                if (value === AIusagePreferenceEnum.Personal) {
                    existingPreference.AIusagePreference =
                        AIusagePreferenceEnum.Personal;
                    await userPreference.storeUserPreference(
                        existingPreference,
                    );
                    const updatedPreference =
                        await userPreference.getUserPreference();

                    const updatedModal = await UserPreferenceModal({
                        app: this.app,
                        modify: this.modify,
                        existingPreference: updatedPreference,
                    });

                    return this.context
                        .getInteractionResponder()
                        .updateModalViewResponse(updatedModal);
                } else {
                    existingPreference.AIusagePreference =
                        AIusagePreferenceEnum.Workspace;
                    await userPreference.storeUserPreference(
                        existingPreference,
                    );
                    const updatedPreference =
                        await userPreference.getUserPreference();

                    const updatedModal = await UserPreferenceModal({
                        app: this.app,
                        modify: this.modify,
                        existingPreference: updatedPreference,
                    });

                    return this.context
                        .getInteractionResponder()
                        .updateModalViewResponse(updatedModal);
                }
                break;
            case UserPreferenceModalEnum.AI_OPTION_DROPDOWN_ACTION_ID:
                const option = value as AIProviderEnum;
                if (value) {
                    if (Object.values(AIProviderEnum).includes(option)) {
                        existingPreference.AIconfiguration.AIProvider = option;
                        await userPreference.storeUserPreference(
                            existingPreference,
                        );
                        const updatedPreference =
                            await userPreference.getUserPreference();

                        const updatedModal = await UserPreferenceModal({
                            app: this.app,
                            modify: this.modify,
                            existingPreference: updatedPreference,
                        });

                        return this.context
                            .getInteractionResponder()
                            .updateModalViewResponse(updatedModal);
                    } else {
                        console.log('value is not part of AIProviderEnum enum');
                    }
                } else {
                    console.log('no value');
                }
                break;
        }

        
        if (actionId.startsWith(ListContextualBarEnum.SEND_ACTION_ID)) {
            const replyId = actionId.split('_').pop();
            if (!replyId) {
                this.app.getLogger().error(`Invalid actionId format: ${actionId}`);
                return this.context.getInteractionResponder().errorResponse();
            }

            const reply = await replyStorage.getReplyById(user, replyId);
            if (!reply) {
                return this.context.getInteractionResponder().errorResponse();
            }

            const sendModal = await SendReplyModal(
                this.app,
                user,
                this.read,
                this.persistence,
                this.modify,
                room,
                reply,
                language,
            );
            return this.context.getInteractionResponder().openModalViewResponse(sendModal);
        }

		return this.context.getInteractionResponder().successResponse();
	}
}