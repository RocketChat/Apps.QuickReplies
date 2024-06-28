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
import { CacheReplyStorage } from '../storage/ReplyCache';
import { Handler } from './Handler';
import { MessageActionButton } from '../enum/notification';
import { ListContextualBarEnum } from '../enum/modals/listContextualBar';
import { getUserPreferredLanguage } from '../helper/userPreference';
import { confirmDeleteModal } from '../modal/confirmDeleteModal';
import { EditReplyModal } from '../modal/editModal';
import { listReplyContextualBar } from '../modal/listContextualBar';

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
		const { actionId, user, container, blockId, value, triggerId } =
			this.context.getInteractionData();
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
			this.app,
			this.read.getPersistenceReader(),
			this.persistence,
			user.id,
		);

		if (!room) {
			if (roomPersistance) {
				room = roomPersistance;
			} else {
				console.log("Room doesn't exist");
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

					const replyCache = new CacheReplyStorage(
						this.persistence,
						this.read.getPersistenceReader(),
					);

					if (!reply) {
						return this.context
							.getInteractionResponder()
							.errorResponse();
					}
					await replyCache.setCacheReply(user, reply);
					const language = await getUserPreferredLanguage(
						this.app,
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
						.updateModalViewResponse(UpdatedListBar);
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
						.updateModalViewResponse(UpdatedListBar);
				}
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
