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
import { SendModal } from '../enum/modals/SendModal';
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

	const labelReplyBody = SendModal.REPLY_BODY_LABEL.toString();
	const placeholderReplyBody = SendModal.REPLY_BODY_PLACEHOLDER.toString();

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
			blockId: SendModal.REPLY_BODY_BLOCK_ID,
			actionId: SendModal.REPLY_BODY_ACTION_ID,
		},
	);

	// blocks.push(inputReplyName);
	blocks.push(inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: SendModal.SEND, style: ButtonStyle.PRIMARY },
		{
			actionId: SendModal.SUBMIT_ACTION_ID,
			blockId: SendModal.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: SendModal.CLOSE, style: ButtonStyle.DANGER },
		{
			actionId: SendModal.CLOSE_ACTION_ID,
			blockId: SendModal.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: SendModal.VIEW_ID,
		title: {
			type: TextObjectType.MRKDWN,
			text: SendModal.TITLE,
		},
		blocks,
		close,
		submit,
	};
}
