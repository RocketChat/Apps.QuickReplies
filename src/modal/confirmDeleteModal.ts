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
import { Language, t } from '../lib/Translation/translation';

export async function confirmDeleteModal(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	reply: IReply,
	language: Language,
): Promise<IUIKitModalViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const confirmDelete = blockBuilder.createSectionBlock({
		text: `### ${t('hey', language)} ${user.name}, ${t(
			'confirm_delete_message',
			language,
		)}`,
	});

	const replyInfo = `**${t('reply_name_label', language)}:** ${reply.name}  
	**${t('reply_body_label', language)}:** ${reply.body}`;

	const replyContent = blockBuilder.createContextBlock({
		contextElements: [replyInfo],
	});

	blocks.push(confirmDelete, replyContent);

	const submit = elementBuilder.addButton(
		{ text: t('delete_button', language), style: ButtonStyle.DANGER },
		{
			actionId: confirmDeleteModalEnum.SUBMIT_ACTION_ID,
			blockId: confirmDeleteModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('close_button', language) },
		{
			actionId: confirmDeleteModalEnum.CLOSE_ACTION_ID,
			blockId: confirmDeleteModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: confirmDeleteModalEnum.VIEW_ID,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('confirm_delete_modal_title', language),
		},
		blocks,
		close,
		submit,
	};
}
