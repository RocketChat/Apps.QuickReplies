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
import { SendModalEnum } from '../enum/modals/sendModal';
import { IReply } from '../definition/reply/IReply';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { Language, t } from '../lib/Translation/translation';

export async function SendReplyModal(
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

	const labelReplyBody = t('send_reply_body_label', language);
	const placeholderReplyBody = t('send_reply_body_placeholder', language);

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
			blockId: SendModalEnum.REPLY_BODY_BLOCK_ID,
			actionId: SendModalEnum.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: t('send_reply_button', language), style: ButtonStyle.PRIMARY },
		{
			actionId: SendModalEnum.SUBMIT_ACTION_ID,
			blockId: SendModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('close_button', language) },
		{
			actionId: SendModalEnum.CLOSE_ACTION_ID,
			blockId: SendModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: SendModalEnum.VIEW_ID,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('send_reply_modal_title', language),
		},
		blocks,
		close,
		submit,
	};
}
