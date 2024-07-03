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
import { ListContextualBarEnum } from '../enum/modals/listContextualBar';
import { Language, t } from '../lib/Translation/translation';

export async function listReplyContextualBar(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	userReplies: IReply[],
	language: Language,
): Promise<IUIKitSurfaceViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();
	const blocks: Block[] = [];
	const divider = blockBuilder.createDividerBlock();

	const sortedReplies = userReplies.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});

	sortedReplies.forEach((reply) => {
		const accessoryElement = elementBuilder.createOverflow(
			{
				options: [
					{
						text: {
							type: 'plain_text',
							text: t('Send_Text', language),
							emoji: true,
						},
						value: `${ListContextualBarEnum.SEND} : ${reply.id}`,
					},
					{
						text: {
							type: 'plain_text',
							text: t('Edit_Text', language),
							emoji: true,
						},
						value: `${ListContextualBarEnum.EDIT} : ${reply.id}`,
					},
					{
						text: {
							type: 'plain_text',
							text: t('Delete_Text', language),
							emoji: true,
						},
						value: `${ListContextualBarEnum.DELETE} : ${reply.id}`,
					},
				],
			},
			{
				blockId: ListContextualBarEnum.REPLY_OVERFLOW_BLOCKID,
				actionId: ListContextualBarEnum.REPLY_OVERFLOW_ACTIONID,
			},
		);

		const name = reply.name.slice(0, 30);
		const body = reply.body.slice(0, 60);
		const replySection = blockBuilder.createSectionBlock({
			text: name,
			accessory: accessoryElement,
		});

		const replyBody = blockBuilder.createContextBlock({
			contextElements: [body],
		});

		blocks.push(replySection, replyBody, divider);
	});

	const close = elementBuilder.addButton(
		{
			text: t('Close_Button', language),
			style: ButtonStyle.DANGER,
		},
		{
			actionId: ListContextualBarEnum.LIST_REPLY_CLOSE_ACTION_ID,
			blockId: ListContextualBarEnum.LIST_REPLY_CLOSE_BLOCK_ID,
		},
	);

	return {
		id: ListContextualBarEnum.VIEW_ID,
		type: UIKitSurfaceType.CONTEXTUAL_BAR,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('List_Reply_Title', language),
		},
		blocks,
		close,
	};
}
