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
import { IReply } from '../definition/reply/IReply';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { editModalEnum } from '../enum/modals/editModal';

export async function EditReplyModal(
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

	const labelReplyName = editModalEnum.REPLY_NAME_LABEL.toString();
	const placeholderReplyName =
		editModalEnum.REPLY_BODY_PLACEHOLDER.toString();

	const inputReplyName = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyName,
			label: labelReplyName,
			optional: false,
			multiline: false,
			initialValue: reply.name,
		},
		{
			blockId: editModalEnum.REPLY_NAME_BLOCK_ID,
			actionId: editModalEnum.REPLY_NAME_ACTION_ID,
		},
	);

	const labelReplyBody = editModalEnum.REPLY_BODY_LABEL.toString();
	const placeholderReplyBody =
		editModalEnum.REPLY_BODY_PLACEHOLDER.toString();

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
			blockId: editModalEnum.REPLY_BODY_BLOCK_ID,
			actionId: editModalEnum.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyName, inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: editModalEnum.SEND, style: ButtonStyle.PRIMARY },
		{
			actionId: editModalEnum.SUBMIT_ACTION_ID,
			blockId: editModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: editModalEnum.CLOSE },
		{
			actionId: editModalEnum.CLOSE_ACTION_ID,
			blockId: editModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: editModalEnum.VIEW_ID,
		title: {
			type: TextObjectType.MRKDWN,
			text: editModalEnum.TITLE,
		},
		blocks,
		close,
		submit,
	};
}
