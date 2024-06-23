import {
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, Block } from '@rocket.chat/ui-kit';

import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { inputElementComponent } from './common/inputElementComponent';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { sendModalEnum } from '../enum/modals/sendModal';
import { IReply } from '../definition/reply/IReply';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

export async function SendReplyModal(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	reply: IReply,
): Promise<IUIKitModalViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const labelReplyBody = sendModalEnum.REPLY_BODY_LABEL.toString();
	const placeholderReplyBody =
		sendModalEnum.REPLY_BODY_PLACEHOLDER.toString();

	const inputReplyBody = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyBody,
			label: labelReplyBody,
			optional: false,
			multiline: true,
			initialValue: reply.body,
		},
		{
			blockId: sendModalEnum.REPLY_BODY_BLOCK_ID,
			actionId: sendModalEnum.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: sendModalEnum.SEND, style: ButtonStyle.PRIMARY },
		{
			actionId: sendModalEnum.SUBMIT_ACTION_ID,
			blockId: sendModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: sendModalEnum.CLOSE },
		{
			actionId: sendModalEnum.CLOSE_ACTION_ID,
			blockId: sendModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: sendModalEnum.VIEW_ID,
		title: {
			type: TextObjectType.MRKDWN,
			text: sendModalEnum.TITLE,
		},
		blocks,
		close,
		submit,
	};
}
