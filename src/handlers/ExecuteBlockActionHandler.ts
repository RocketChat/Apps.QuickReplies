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
import { setUserPreferenceModal } from '../modal/UserPreferenceModal';
import {
	AIoptions,
	AIpreferenceEnum,
} from '../definition/helper/userPreference';

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

		const language = await getUserPreferredLanguage(
			this.read.getPersistenceReader(),
			this.persistence,
			user.id,
		);

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

								break;
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

								break;
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
				const replyStorage = new ReplyStorage(
					this.persistence,
					persistenceRead,
				);
				const userReplies = await replyStorage.getReplyForUser(user);
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
				const aistorage1 = new AIstorage(
					this.persistence,
					this.read.getPersistenceReader(),
					user.id,
				);
				const message = await aistorage1.getMessage();
				const prompt = await aistorage1.getPrompt();

				const response = await new AIHandler(
					this.app,
					this.http,
				).handleResponse(user, message, prompt);

				await aistorage1.updateResponse(response);

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
			case 'AI_PREFERENCE_DROPDOWN_ACTION_ID':
				console.log(value);
				if (value === AIpreferenceEnum.Personal) {
					const updatedModal = await setUserPreferenceModal({
						app: this.app,
						modify: this.modify,
						existingPreferencelanguage: language,
						PreferedAI: AIpreferenceEnum.Personal,
					});

					return this.context
						.getInteractionResponder()
						.updateModalViewResponse(updatedModal);
				}
				break;
			case 'AI_DROPDOWN_ACTION_ID':
				// console.log(value) as AIoptions;
				const option = value as AIoptions;
				// check if value is part of AIoptions enum
				// if yes, update the user preference
				// else return an error message

				// if (value === AIoptions) {
				// 	const updatedModal = await setUserPreferenceModal({
				// 		app: this.app,
				// 		modify: this.modify,
				// 		existingPreferencelanguage: language,
				// 		PreferedAI: AIpreferenceEnum.Personal,
				// 	});

				// 	return this.context
				// 		.getInteractionResponder()
				// 		.updateModalViewResponse(updatedModal);
				// }
				if (value) {
					if (Object.values(AIoptions).includes(option)) {
						console.log('value is part of AIoptions enum');
						const updatedModal = await setUserPreferenceModal({
							app: this.app,
							modify: this.modify,
							existingPreferencelanguage: language,
							PreferedAI: AIpreferenceEnum.Personal,
							ChoosedAIoption: option,
						});

						return this.context
							.getInteractionResponder()
							.updateModalViewResponse(updatedModal);
					} else {
						console.log('value is not part of AIoptions enum');
					}
				} else {
					console.log('no value');
				}
				break;
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
