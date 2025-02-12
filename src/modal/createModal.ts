import {
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, InputBlock } from '@rocket.chat/ui-kit';

import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { inputElementComponent } from './common/inputElementComponent';
import {
	ButtonStyle,
	UIKitSurfaceType,
} from '@rocket.chat/apps-engine/definition/uikit';
import { CreateModalEnum } from '../enum/modals/createModal';
import { Language, t } from '../lib/Translation/translation';
import { ReplyStorage } from '../storage/ReplyStorage';
import { sendNotification } from '../helper/notification';

export async function CreateReplyModal(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	language: Language,
	args: string[],
): Promise<IUIKitSurfaceViewParam | Error | void> {
	if (args.length > 1) {
		const replyName = args[1];
		const replyBody = args.slice(2).join(' ');

		const replyStorage = new ReplyStorage(persistence, read.getPersistenceReader());

		const result = await replyStorage.createReply(user, replyName, replyBody, language); 

		const message = result.success
			? t('Success_Create_Reply', language, {
				name: user.name,
				replyname: replyName,
			})
			: `${t('Fail_Create_Reply', language, {
				name: user.name,
			})} \n\n ${result.error}`;

		await sendNotification(read, modify, user, room, { message });
		return;
	}

	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: InputBlock[] = [];

	const labelReplyName = t('Reply_Name_Label', language);
	const placeholderReplyName = t('Reply_Name_Placeholder', language);

	const inputReplyName = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyName,
			label: labelReplyName,
			optional: false,
		},
		{
			blockId: CreateModalEnum.REPLY_NAME_BLOCK_ID,
			actionId: CreateModalEnum.REPLY_NAME_ACTION_ID,
		},
	);

	const labelReplyBody = t('Reply_Body_Label', language);
	const placeholderReplyBody = t('Reply_Body_Placeholder', language);

	const inputReplyBody = inputElementComponent(
		{
			app,
			placeholder: placeholderReplyBody,
			label: labelReplyBody,
			optional: false,
			multiline: true,
		},
		{
			blockId: CreateModalEnum.REPLY_BODY_BLOCK_ID,
			actionId: CreateModalEnum.REPLY_BODY_ACTION_ID,
		},
	);

	blocks.push(inputReplyName, inputReplyBody);

	const submit = elementBuilder.addButton(
		{ text: t('Create_Button', language), style: ButtonStyle.PRIMARY },
		{
			actionId: CreateModalEnum.SUBMIT_ACTION_ID,
			blockId: CreateModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('Close_Button', language), style: ButtonStyle.DANGER },
		{
			actionId: CreateModalEnum.CLOSE_ACTION_ID,
			blockId: CreateModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: `${CreateModalEnum.VIEW_ID}`,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: t('Create_Modal_Title', language),
		},
		blocks,
		close,
		submit,
	};
}