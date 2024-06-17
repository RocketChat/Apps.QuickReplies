import {
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { Block, TextObjectType } from '@rocket.chat/ui-kit';
import {
	ButtonStyle,
	UIKitSurfaceType,
} from '@rocket.chat/apps-engine/definition/uikit';

import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IReply } from '../definition/reply/IReply';
import { ListContextualBar } from '../enum/modals/ListContextualBar';

export async function listReply(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	userReplies: IReply[],
): Promise<IUIKitSurfaceViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();
	const blocks: Block[] = [];
	const divider = blockBuilder.createDividerBlock();

	userReplies.forEach((reply) => {
		const accessoryElement = elementBuilder.createOverflow(
			{
				options: [
					{
						text: {
							type: 'plain_text',
							text: ListContextualBar.SEND,
							emoji: true,
						},
						value: `send : ${reply.id}`,
					},
					{
						text: {
							type: 'plain_text',
							text: ListContextualBar.EDIT,
							emoji: true,
						},
						value: `edit : ${reply.id}`,
					},
					{
						text: {
							type: 'plain_text',
							text: ListContextualBar.DELETE,
							emoji: true,
						},
						value: `delete : ${reply.id}`,
					},
				],
			},
			{
				blockId: ListContextualBar.REPLY_OVERFLOW_BLOCKID,
				actionId: ListContextualBar.REPLY_OVERFLOW_ACTIONID,
			},
		);

		const replySection = blockBuilder.createSectionBlock({
			text: reply.name,
			accessory: accessoryElement,
		});

		const replyBody = blockBuilder.createContextBlock({
			contextElements: [reply.body],
		});

		blocks.push(replySection, replyBody, divider);
	});

	const close = elementBuilder.addButton(
		{
			text: ListContextualBar.CLOESE_BUTTON_TEXT,
			style: ButtonStyle.DANGER,
		},
		{
			actionId: ListContextualBar.LIST_REPLY_CLOSE_ACTION_ID,
			blockId: ListContextualBar.LIST_REPLY_CLOSE_BLOCK_ID,
		},
	);

	return {
		id: ListContextualBar.VIEW_ID,
		// id: ListContextualBar.VIEW_ID,
		type: UIKitSurfaceType.CONTEXTUAL_BAR,
		title: {
			type: TextObjectType.MRKDWN,
			// text: ListContextualBar.TITLE,
			text: ListContextualBar.TITLE,
		},
		blocks,
		close,
	};
}
