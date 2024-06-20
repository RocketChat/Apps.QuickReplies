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
import { Handler } from './Handler';
import { messageActionButton } from '../enum/notification';

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
		console.log('handler hit');
		const persistenceRead = this.read.getPersistenceReader();

		const roomInteractionStorage = new RoomInteractionStorage(
			this.persistence,
			persistenceRead,
			user.id,
		);

		const roomId = await roomInteractionStorage.getInteractionRoomId();
		const roomPersistance = await this.read.getRoomReader().getById(roomId);
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
			case ListContextualBar.REPLY_OVERFLOW_ACTIONID: {
				console.log(value);
				if (value) {
					const command = value.split(' : ')[0].trim();
					const replyId = value.split(' : ')[1].trim();
					switch (command) {
						case ListContextualBar.SEND:
							console.log('send', replyId);
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
				break;
			}
			case messageActionButton.CREATE_REPLY_ACTION_ID: {
				await handler.Create();
				break;
			}
			case messageActionButton.LIST_REPLY_ACTION_ID: {
				await handler.List();
				break;
			}
			case messageActionButton.CONFIGURE_PREFERENCES_ACTION_ID:
				// await handler.Configure();
				break;
			case messageActionButton.NEED_MORE_ACTION_ID:
				await handler.Help();
				break;
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
