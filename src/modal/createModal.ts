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
import { createModalEnum } from '../enum/modals/createModal';
import { Language, t } from '../lib/Translation/translation';

export async function CreateReplyModal(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	language: Language,
): Promise<IUIKitSurfaceViewParam | Error> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const labelReplyName = t('reply_name_label', language);
	const placeholderReplyName = t('reply_name_placeholder', language);

	const inputReplyName = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyName,
			label: labelReplyName,
			optional: false,
		},
		{
			blockId: createModalEnum.REPLY_NAME_BLOCK_ID,
			actionId: createModalEnum.REPLY_NAME_ACTION_ID,
		},
	);

	const labelReplyBody = t('reply_body_label', language);
	const placeholderReplyBody = t('reply_body_placeholder', language);

	const inputReplyBody = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyBody,
			label: labelReplyBody,
			optional: false,
			multiline: true,
		},
		{
			blockId: createModalEnum.REPLY_BODY_BLOCK_ID,
			actionId: createModalEnum.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyName, inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: t('create_button', language), style: ButtonStyle.PRIMARY },
		{
			actionId: createModalEnum.SUBMIT_ACTION_ID,
			blockId: createModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('close_button', language), style: ButtonStyle.DANGER },
		{
			actionId: createModalEnum.CLOSE_ACTION_ID,
			blockId: createModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: createModalEnum.VIEW_ID,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('create_modal_title', language),
		},
		blocks,
		close,
		submit,
	};
}
