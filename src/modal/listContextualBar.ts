import {
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
	InputBlock,
	TextObjectType,
	DividerBlock,
	SectionBlock,
	ContextBlock,
	ActionsBlock,
} from '@rocket.chat/ui-kit';
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
import { inputElementComponent } from './common/inputElementComponent';
import { MessageActionButton } from '../enum/notification';

export async function listReplyContextualBar(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	userReplies: IReply[],
	language: Language,
	searchValue?: string,
): Promise<IUIKitSurfaceViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();
	const blocks: (
		| InputBlock
		| DividerBlock
		| SectionBlock
		| ContextBlock
		| ActionsBlock
	)[] = [];
	const divider = blockBuilder.createDividerBlock();
	let Replies = userReplies;

	const searchValueLowerCase = searchValue?.toLowerCase();

	if (searchValueLowerCase) {
		Replies = userReplies.filter((reply) => {
			return (
				reply.name.toLowerCase().includes(searchValueLowerCase) ||
				reply.body.toLowerCase().includes(searchValueLowerCase)
			);
		});
	}

	const sortedReplies = Replies.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});

	const searchInput = inputElementComponent(
		{
			app,
			placeholder: t('Search_Reply_Placeholder', language),
			label: t('Search_Reply_Label', language),
			dispatchActionConfigOnInput: true,
		},
		{
			blockId: ListContextualBarEnum.SEARCH_BLOCK_ID,
			actionId: ListContextualBarEnum.SEARCH_ACTION_ID,
		},
	);

	const ButtonRefresh = elementBuilder.addButton(
		{ text: t('Refresh_Button_Text', language) },
		{
			actionId: ListContextualBarEnum.REFRESH_BUTTON_ACTIONID,
			blockId: ListContextualBarEnum.REFRESH_BUTTON_BLOCKID,
		},
	);
	const buttonElement = elementBuilder.addButton(
		{ text: t('Create_Reply', language), style: 'primary' },

		{
			actionId: MessageActionButton.CREATE_REPLY_ACTION_ID,
			blockId: MessageActionButton.CREATE_REPLY_BLOCK_ID,
		},
	);

	const buttonAction = blockBuilder.createActionBlock({
		elements: [ButtonRefresh, buttonElement],
	});

	blocks.push(searchInput, buttonAction, divider);

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

		const name = reply.name.slice(0, 40);
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

	if (sortedReplies.length === 0) {
		const noReplies = blockBuilder.createSectionBlock({
			text: t('No_Quick_Replies_Found', language),
		});

		blocks.push(noReplies);
	}

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
