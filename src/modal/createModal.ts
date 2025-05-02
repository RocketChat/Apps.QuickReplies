import {
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, InputBlock, ContextBlock } from '@rocket.chat/ui-kit';

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

export async function CreateReplyModal(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	language: Language,
	errors?: {
		nameError?: boolean;
		bodyError?: boolean;
	}
): Promise<IUIKitSurfaceViewParam | Error> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Array<InputBlock | ContextBlock> = [];

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

	blocks.push(inputReplyName);

	// Add name error context block if needed
	if (errors?.nameError) {
		const nameErrorContext = blockBuilder.createContextBlock({
			blockId: CreateModalEnum.NAME_ERROR_BLOCK_ID,
			contextElements: ['**❗ Name field is required**']
		});
		blocks.push(nameErrorContext);
	}

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

	blocks.push(inputReplyBody);

	// Add body error context block if needed
	if (errors?.bodyError) {
		const bodyErrorContext = blockBuilder.createContextBlock({
			blockId: CreateModalEnum.BODY_ERROR_BLOCK_ID,
			contextElements: ['**❗ Body field is required**']
		});
		blocks.push(bodyErrorContext);
	}

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
