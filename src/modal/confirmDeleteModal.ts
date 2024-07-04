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
import {
	ButtonStyle,
	UIKitSurfaceType,
} from '@rocket.chat/apps-engine/definition/uikit';
import { IReply } from '../definition/reply/IReply';
import { ConfirmDeleteModalEnum } from '../enum/modals/confirmDeleteModal';
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
): Promise<IUIKitSurfaceViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const confirmDelete = blockBuilder.createSectionBlock({
		text: `### ${t('Confirm_Delete_Message', language)}`,
	});

	const replyInfo = `${t('Delete_Reply_Info', language, {
		replyname: reply.name,
		replybody: reply.body,
	})}`;

	const replyContent = blockBuilder.createContextBlock({
		contextElements: [replyInfo],
	});

	blocks.push(confirmDelete, replyContent);

	const submit = elementBuilder.addButton(
		{ text: t('Delete_Button', language), style: ButtonStyle.DANGER },
		{
			actionId: ConfirmDeleteModalEnum.SUBMIT_ACTION_ID,
			blockId: ConfirmDeleteModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('Close_Button', language) },
		{
			actionId: ConfirmDeleteModalEnum.CLOSE_ACTION_ID,
			blockId: ConfirmDeleteModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: ConfirmDeleteModalEnum.VIEW_ID,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('Confirm_Delete_Modal_Title', language),
		},
		blocks,
		close,
		submit,
	};
}
