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
import { IReply } from '../definition/reply/IReply';
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
	body?: string,
): Promise<IUIKitSurfaceViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const labelReplyName = t('Edit_Reply_Name_Label', language);
	const placeholderReplyName = t('Edit_Reply_Name_Placeholder', language);

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

	const labelReplyBody = t('Edit_Reply_Body_Label', language);
	const placeholderReplyBody = t('Edit_Reply_Body_Placeholder', language);

	const inputReplyBody = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyBody,
			label: labelReplyBody,
			optional: false,
			multiline: true,
			initialValue: body ? body : reply.body,
		},
		{
			blockId: EditModalEnum.REPLY_BODY_BLOCK_ID,
			actionId: EditModalEnum.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyName, inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: t('Edit_Button', language), style: ButtonStyle.PRIMARY },
		{
			actionId: EditModalEnum.SUBMIT_ACTION_ID,
			blockId: EditModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('Close_Button', language) },
		{
			actionId: EditModalEnum.CLOSE_ACTION_ID,
			blockId: EditModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: EditModalEnum.VIEW_ID,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('Edit_Modal_Title', language),
		},
		blocks,
		close,
		submit,
	};
}
