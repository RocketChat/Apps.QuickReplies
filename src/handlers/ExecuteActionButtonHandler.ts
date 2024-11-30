import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
	IUIKitResponse,
	UIKitActionButtonInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { Handler } from './Handler';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { ActionButton } from '../enum/modals/common/ActionButtons';
import { getUserPreferredLanguage } from '../helper/userPreference';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { Receiverstorage } from '../storage/ReceiverStorage';

export class ExecuteActionButtonHandler {
	private context: UIKitActionButtonInteractionContext;
	constructor(
		protected readonly app: QuickRepliesApp,
		protected readonly read: IRead,
		protected readonly http: IHttp,
		protected readonly persistence: IPersistence,
		protected readonly modify: IModify,
		protected readonly params: string[] = [],
		context: UIKitActionButtonInteractionContext,
	) {
		this.context = context;
	}

	public async handleActions(): Promise<IUIKitResponse> {
		const { actionId, user, room, triggerId, message } =
			this.context.getInteractionData();

		const language = await getUserPreferredLanguage(
			this.read.getPersistenceReader(),
			this.persistence,
			user.id,
		);

		const roomInteractionStorage = new RoomInteractionStorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);
		roomInteractionStorage.storeInteractionRoomId(room.id);

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
			args: this.params,
		});

		switch (actionId) {
			case ActionButton.LIST_QUICK_REPLY_ACTION: {
				await handler.ListReply();
				break;
			}
			case ActionButton.CREATE_QUICK_REPLY_ACTION: {
				await handler.CreateReply();
				break;
			}
		}

		const hasTextOrAttachments =
			(message?.text || message?.attachments) && actionId;

		if (hasTextOrAttachments) {
			const textMessage =
				message?.text || message?.attachments?.[0]?.description || '';

			if (!textMessage.trim()) {
				return this.context.getInteractionResponder().errorResponse();
			}

			switch (actionId) {
				case ActionButton.REPLY_USING_AI_ACTION: {
					await handler.replyUsingAI(textMessage.trim());
					break;
				}
				case ActionButton.SEND_REPLY_ACTION: {
					const PlaceHolderValues = {
						room: message.room.slugifiedName,
						username: message.sender.username,
						name: message.sender.name,
						email: message.sender?.emails[0]?.address,
					};
					const ReceiverStorage = new Receiverstorage(
						this.persistence,
						this.read.getPersistenceReader(),
						user.id,
					);
					await ReceiverStorage.setReceiverRecord(PlaceHolderValues);

					await handler.ListReply();
					break;
				}
				default: {
					console.log('Unhandled actionId:', actionId);
				}
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
