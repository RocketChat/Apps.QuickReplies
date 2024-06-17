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
import { CreateModal } from '../enum/modals/CreateModal';
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
			case CreateModal.VIEW_ID: {
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
		const nameStateValue =
			view.state?.[CreateModal.REPLY_NAME_BLOCK_ID]?.[
				CreateModal.REPLY_NAME_ACTION_ID
			];

		const bodyStateValue =
			view.state?.[CreateModal.REPLY_BODY_BLOCK_ID]?.[
				CreateModal.REPLY_BODY_ACTION_ID
			];

		if (!nameStateValue || !bodyStateValue) {
			const missingFields: string[] = [];
			if (!nameStateValue) missingFields.push('name');
			if (!bodyStateValue) missingFields.push('body');

			const errorMessage = `Hey ${
				user.name
			}, \n please provide a **${missingFields.join(
				'** and a **',
			)}** for the reply. ❌`;
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
			const successMessage = `Hey ${user.name}, reply **${name}** created successfully! ✅`;
			await sendNotification(this.read, this.modify, user, room, {
				message: successMessage,
			});
			return this.context.getInteractionResponder().successResponse();
		} else {
			const errorMessage = `Hey ${user.name}, failed to create reply. ❌\n\nError: ${result.error}`;
			await sendNotification(this.read, this.modify, user, room, {
				message: errorMessage,
			});
			return this.context.getInteractionResponder().errorResponse();
		}
	}
}
