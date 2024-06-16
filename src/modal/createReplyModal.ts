import {
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, Block } from '@rocket.chat/ui-kit';

import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { inputElementComponent } from './common/inputElementComponent';
import {
	ButtonStyle,
	UIKitSurfaceType,
} from '@rocket.chat/apps-engine/definition/uikit';
import { Create } from '../enum/Create';

export async function CreateReplyModal(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
): Promise<IUIKitSurfaceViewParam | Error> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const labelReplyName = Create.REPLY_NAME_LABEL.toString();
	const placeholderReplyName = Create.REPLY_NAME_PLACEHOLDER.toString();

	const inputReplyName = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyName,
			label: labelReplyName,
			optional: false,
		},
		{
			blockId: Create.REPLY_NAME_BLOCK_ID,
			actionId: Create.REPLY_NAME_ACTION_ID,
		},
	);

	const labelReplyBody = Create.REPLY_BODY_LABEL.toString();
	const placeholderReplyBody = Create.REPLY_BODY_PLACEHOLDER.toString();

	const inputReplyBody = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyBody,
			label: labelReplyBody,
			optional: false,
			multiline: true,
		},
		{
			blockId: Create.REPLY_BODY_BLOCK_ID,
			actionId: Create.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyName);
	blocks.push(inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: Create.CREATE, style: ButtonStyle.PRIMARY },
		{
			actionId: Create.SUBMIT_ACTION_ID,
			blockId: Create.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: Create.CLOSE, style: ButtonStyle.DANGER },
		{
			actionId: Create.CLOSE_ACTION_ID,
			blockId: Create.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: Create.VIEW_ID,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: Create.TITLE,
		},
		blocks,
		close,
		submit,
	};
}
