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
import { messageActionButton } from '../enum/notification';
import { listContextualBarEnum } from '../enum/modals/listContextualBar';
import { getUserPreferredLanguage } from '../helper/userPreference';
import { confirmDeleteModal } from '../modal/confirmDeleteModal';
import { EditReplyModal } from '../modal/editModal';

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
		console.log(actionId);

		switch (actionId) {
			case listContextualBarEnum.REPLY_OVERFLOW_ACTIONID: {
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
							case listContextualBarEnum.SEND:
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
							case listContextualBarEnum.EDIT:
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
							case listContextualBarEnum.DELETE:
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
			case messageActionButton.CREATE_REPLY_ACTION_ID: {
				await handler.CreateReply();
				break;
			}
			case messageActionButton.LIST_REPLY_ACTION_ID: {
				await handler.ListReply();
				break;
			}
			case messageActionButton.CONFIGURE_PREFERENCES_ACTION_ID:
				await handler.Configure();
				break;
			case messageActionButton.NEED_MORE_ACTION_ID:
				await handler.Help();
				break;
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
