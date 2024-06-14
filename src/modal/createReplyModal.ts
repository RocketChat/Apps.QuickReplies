import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
// import { ModalsEnum } from "../enum/Modals";
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { ModalsEnum } from '../enum/modal';
// import {
//     storeInteractionRoomData,
//     getInteractionRoomData,
// } from "../persistance/roomInteraction";

export async function CreateReplyModal({
	modify,
	read,
	persistence,
	http,
	slashcommandcontext,
	uikitcontext,
}: {
	modify: IModify;
	read: IRead;
	persistence: IPersistence;
	http: IHttp;
	slashcommandcontext?: SlashCommandContext;
	uikitcontext?: UIKitInteractionContext;
}): Promise<IUIKitModalViewParam> {
	const viewId = ModalsEnum.CREATE_REPLY_VIEW;
	const block = modify.getCreator().getBlockBuilder();
	const room =
		slashcommandcontext?.getRoom() ||
		uikitcontext?.getInteractionData().room;
	const user =
		slashcommandcontext?.getSender() ||
		uikitcontext?.getInteractionData().user;

	// if (user?.id) {
	//     let roomId;

	//     if (room?.id) {
	//         roomId = room.id;
	//         await storeInteractionRoomData(persistence, user.id, roomId);
	//     } else {
	//         roomId = (
	//             await getInteractionRoomData(
	//                 read.getPersistenceReader(),
	//                 user.id
	//             )
	//         ).roomId;
	//     }

	block.addInputBlock({
		blockId: ModalsEnum.REPLY_NAME_INPUT,
		label: {
			text: ModalsEnum.REPLY_NAME_LABEL,
			type: TextObjectType.PLAINTEXT,
		},
		element: block.newPlainTextInputElement({
			actionId: ModalsEnum.REPLY_NAME_INPUT_ACTION,
			placeholder: {
				text: ModalsEnum.REPLY_NAME_PLACEHOLDER,
				type: TextObjectType.PLAINTEXT,
			},
		}),
	});

	block.addDividerBlock();

	block.addInputBlock({
		blockId: ModalsEnum.REPLY_BODY_INPUT,
		label: {
			text: ModalsEnum.REPLY_BODY_LABEL,
			type: TextObjectType.PLAINTEXT,
		},
		element: block.newPlainTextInputElement({
			actionId: ModalsEnum.REPLY_BODY_INPUT_ACTION,
			placeholder: {
				text: ModalsEnum.REPLY_BODY_PLACEHOLDER,
				type: TextObjectType.PLAINTEXT,
			},
			multiline: true,
		}),
	});
	// }


	return {
		id: viewId,
		title: {
			type: TextObjectType.PLAINTEXT,
			text: 'Create New reply',
		},
		close: block.newButtonElement({
			text: {
				type: TextObjectType.PLAINTEXT,
				text: 'Close',
			},
		}),
		submit: block.newButtonElement({
			actionId: ModalsEnum.CREATE_NEW_REPLY_ACTION,
			text: {
				type: TextObjectType.PLAINTEXT,
				emoji: true,
				text: 'Create',
			},
		}),
		blocks: block.getBlocks(),
	};
}
