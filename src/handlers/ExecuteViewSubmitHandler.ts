import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { ModalsEnum } from '../enum/modal';
import { QuickRepliesApp } from '../../QuickRepliesApp';
// import { sendMessage } from "../lib/sendMessage";
// import { deleteAI, GetAI } from "../persistance/askai";
// import { getInteractionRoomData } from "../persistance/roomInteraction";
// import { QuickApp } from "../../Quick";
// import { createReply } from "./persistance/StoreReply";
// import { EditReplyHandler } from "./persistance/EditReply";
// import { ListModal } from "../modal/ListModal";
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

					console.log(name, body, user);
					
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
