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
import { ListContextualBar } from '../enum/modals/ListContextualBar';
import { ReplyStorage } from '../storage/ReplyStorage';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { SendReplyModal } from '../modal/sendReplyModal';

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
		const { actionId, user, container, blockId, value } =
			this.context.getInteractionData();
		const persistenceRead = this.read.getPersistenceReader();

		const roomInteractionStorage = new RoomInteractionStorage(
			this.persistence,
			persistenceRead,
			user.id,
		);
		const roomId = await roomInteractionStorage.getInteractionRoomId();
		const room = (await this.read.getRoomReader().getById(roomId)) as IRoom;

		// const room = roomInteractionStorage.getInteractionRoomId();

		switch (actionId) {
			case ListContextualBar.REPLY_OVERFLOW_ACTIONID: {
				// console.log(value);
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

					// console.log(reply);
					if (reply && room) {
						switch (command) {
							case ListContextualBar.SEND:
								console.log('send handler', replyId);

								const sendModal = await SendReplyModal(
									this.app,
									user,
									this.read,
									this.persistence,
									this.modify,
									room,
									reply,
								);

								return this.context
									.getInteractionResponder()
									.openModalViewResponse(sendModal);

								break;
							case ListContextualBar.EDIT:
								console.log('edit', replyId);
								break;
							case 'Delete':
								console.log('Delete', replyId);
								break;
							default:
						}
					}
				}
				break;
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
