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
import { sendNotification } from '../helper/message';
import { Create } from '../enum/Create';
import { ReplyStorage } from '../storage/ReplyStorage';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

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

		switch (view.id) {
			case Create.VIEW_ID: {
				return this.handleCreate(room, user, view);
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}

	public async handleCreate(
		room: IRoom,
		user: IUser,
		view: IUIKitSurface,
	): Promise<IUIKitResponse> {
		const name =
			view.state?.[Create.REPLY_NAME_BLOCK_ID]?.[
				Create.REPLY_NAME_ACTION_ID
			];

		const body =
			view.state?.[Create.REPLY_BODY_BLOCK_ID]?.[
				Create.REPLY_BODY_ACTION_ID
			];

		const replyStorage = new ReplyStorage(
			this.persistence,
			this.read.getPersistenceReader(),
		);

		const result = await replyStorage.createReply(user, name, body);

		if (result.success) {
			console.log('Reply created successfully');
			const message = `Hey ${user.name} \n Reply created successfully`;
			await sendNotification(this.read, this.modify, user, room, {
				message,
			});
		} else {
			console.log('Failed to create reply:', result.error);
			const message = `Hey ${user.name} \n Failed to create reply for you \n ${result.error}`;
			await sendNotification(this.read, this.modify, user, room, {
				message,
			});
			return this.context.getInteractionResponder().errorResponse();
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
