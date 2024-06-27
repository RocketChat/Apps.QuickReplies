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
import { EditModalEnum } from '../enum/modals/editModal';
import { Language, t } from '../lib/Translation/translation';

export async function EditReplyModal(
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

	const labelReplyName = t('edit_reply_name_label', language);
	const placeholderReplyName = t('edit_reply_name_placeholder', language);

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
			blockId: EditModalEnum.REPLY_NAME_BLOCK_ID,
			actionId: EditModalEnum.REPLY_NAME_ACTION_ID,
		},
	);

	const labelReplyBody = t('edit_reply_body_label', language);
	const placeholderReplyBody = t('edit_reply_body_placeholder', language);

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
			blockId: EditModalEnum.REPLY_BODY_BLOCK_ID,
			actionId: EditModalEnum.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyName, inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: t('edit_button', language), style: ButtonStyle.PRIMARY },
		{
			actionId: EditModalEnum.SUBMIT_ACTION_ID,
			blockId: EditModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('close_button', language) },
		{
			actionId: EditModalEnum.CLOSE_ACTION_ID,
			blockId: EditModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: EditModalEnum.VIEW_ID,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('edit_modal_title', language),
		},
		blocks,
		close,
		submit,
	};
}
