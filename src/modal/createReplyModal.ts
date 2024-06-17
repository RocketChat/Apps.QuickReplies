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
import { CreateModal } from '../enum/modals/CreateModal';

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

	const labelReplyName = CreateModal.REPLY_NAME_LABEL.toString();
	const placeholderReplyName = CreateModal.REPLY_NAME_PLACEHOLDER.toString();

	const inputReplyName = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyName,
			label: labelReplyName,
			optional: false,
		},
		{
			blockId: CreateModal.REPLY_NAME_BLOCK_ID,
			actionId: CreateModal.REPLY_NAME_ACTION_ID,
		},
	);

	const labelReplyBody = CreateModal.REPLY_BODY_LABEL.toString();
	const placeholderReplyBody = CreateModal.REPLY_BODY_PLACEHOLDER.toString();

	const inputReplyBody = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyBody,
			label: labelReplyBody,
			optional: false,
			multiline: true,
		},
		{
			blockId: CreateModal.REPLY_BODY_BLOCK_ID,
			actionId: CreateModal.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyName);
	blocks.push(inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: CreateModal.CREATE, style: ButtonStyle.PRIMARY },
		{
			actionId: CreateModal.SUBMIT_ACTION_ID,
			blockId: CreateModal.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: CreateModal.CLOSE, style: ButtonStyle.DANGER },
		{
			actionId: CreateModal.CLOSE_ACTION_ID,
			blockId: CreateModal.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: CreateModal.VIEW_ID,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: CreateModal.TITLE,
		},
		blocks,
		close,
		submit,
	};
}
