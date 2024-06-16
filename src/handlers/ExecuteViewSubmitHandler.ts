import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { ModalsEnum } from '../enum/modal';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { ReplyStorage } from '../storage/ReplyStorage';
import { sendNotification } from '../helper/message';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';

export class ExecuteViewSubmitHandler {
	constructor(
		private readonly app: QuickRepliesApp,
		private readonly read: IRead,
		private readonly http: IHttp,
		private readonly modify: IModify,
		private readonly persistence: IPersistence,
	) {}

	public async run(context: UIKitViewSubmitInteractionContext) {
		const { user, view } = context.getInteractionData();

		try {
			switch (view.id) {
				case ModalsEnum.CREATE_REPLY_VIEW: {
					const name = view.state?.[ModalsEnum.REPLY_NAME_INPUT]?.[
						ModalsEnum.REPLY_NAME_INPUT_ACTION
					] as string;
					const body = view.state?.[ModalsEnum.REPLY_BODY_INPUT]?.[
						ModalsEnum.REPLY_BODY_INPUT_ACTION
					] as string;

					const replyStorage = new ReplyStorage(
						this.persistence,
						this.read.getPersistenceReader(),
					);

					const result = await replyStorage.createReply(
						user,
						name,
						body,
					);

					if (result.success) {
						console.log('Reply created successfully');
					} else {
						console.log('Failed to create reply:', result.error);

						const roomInteractionStorage =
							new RoomInteractionStorage(
								this.persistence,
								this.read.getPersistenceReader(),
								user.id,
							);
						const roomId =
							await roomInteractionStorage.getInteractionRoomId();
						const room = (await this.read
							.getRoomReader()
							.getById(roomId)) as IRoom;
						console.log(room);
						if (room) {
							sendNotification(
								this.read,
								this.modify,
								user,
								room,
								{
									message: `Failed to create reply: ${result.error}`,
								},
							);
						}
					}

					break;
				}
				default:
					break;
			}
		} catch (error) {
			console.log('error : ', error);
		}

		return {
			success: true,
		};
	}
}
