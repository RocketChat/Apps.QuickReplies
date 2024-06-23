import {
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, Block } from '@rocket.chat/ui-kit';

import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { IReply } from '../definition/reply/IReply';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { confirmDeleteModalEnum } from '../enum/modals/confirmDeleteModal';

export async function confirmDeleteModal(
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

	const confirmDelete = blockBuilder.createSectionBlock({
		text: `### Hey ${user.name}, Are you sure you want to delete this reply?`,
	});

	const replyInfo = `**Reply name:** ${reply.name}  
	**Reply content:** ${reply.body}`;

	const replyContent = blockBuilder.createContextBlock({
		contextElements: [replyInfo],
	});

	blocks.push(confirmDelete, replyContent);

	const submit = elementBuilder.addButton(
		{ text: confirmDeleteModalEnum.DELETE, style: ButtonStyle.DANGER },
		{
			actionId: confirmDeleteModalEnum.SUBMIT_ACTION_ID,
			blockId: confirmDeleteModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: confirmDeleteModalEnum.CLOSE },
		{
			actionId: confirmDeleteModalEnum.CLOSE_ACTION_ID,
			blockId: confirmDeleteModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: confirmDeleteModalEnum.VIEW_ID,
		title: {
			type: TextObjectType.MRKDWN,
			text: confirmDeleteModalEnum.TITLE,
		},
		blocks,
		close,
		submit,
	};
}
