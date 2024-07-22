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
import { Language, t } from '../lib/Translation/translation';
import { ReplyAIModalEnum } from '../enum/modals/AIreplyModal';
import { inputElementComponent } from './common/inputElementComponent';

export async function ReplyAIModal(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	language: Language,
	message: string,
	response?: string,
): Promise<IUIKitSurfaceViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	// const labelReplyName = t('Reply_Name_Label', language);
	// const placeholderReplyName = t('Reply_Name_Placeholder', language);

	const messageText = message.trim().slice(0, 40);
	const messageblock = blockBuilder.createSectionBlock({
		text: `Message: ${messageText}`,
	});

	const promptInput = inputElementComponent(
		{
			app,
			placeholder: 'Enter the prompt',
			label: 'Prompt',
			optional: false,
			dispatchActionConfigOnInput: true,
		},
		{
			blockId: ReplyAIModalEnum.PROMPT_INPUT_BLOCK_ID,
			actionId: ReplyAIModalEnum.PROMPT_INPUT_ACTION_ID,
		},
	);

	const GenerateButton = elementBuilder.addButton(
		{
			text: response ? 'Regenerate' : 'Generate',
			style: ButtonStyle.PRIMARY,
		},
		{
			actionId: ReplyAIModalEnum.GENERATE_BUTTON_ACTION_ID,
			blockId: ReplyAIModalEnum.GENERATE_BUTTON_BLOCK_ID,
		},
	);

	const secitonBlock = blockBuilder.createSectionBlock({
		accessory: GenerateButton,
	});

	blocks.push(messageblock, promptInput, GenerateButton, secitonBlock);

	if (response) {
		const labelReplyBody = 'Response';
		const placeholderReplyBody = 'Response';

		const inputReplyBody = inputElementComponent(
			{
				app,
				placeholder: placeholderReplyBody,
				label: labelReplyBody,
				optional: false,
				multiline: true,
				initialValue: response,
			},
			{
				blockId: `${ReplyAIModalEnum.RESPONSE_BODY_BLOCK_ID} --- ${response}`,
				actionId: `${ReplyAIModalEnum.RESPONSE_BODY_ACTION_ID} --- ${response}`,
			},
		);
		blocks.push(inputReplyBody);
	}

	const submit = elementBuilder.addButton(
		{ text: 'Send this reply', style: ButtonStyle.PRIMARY },
		{
			actionId: ReplyAIModalEnum.SUBMIT_ACTION_ID,
			blockId: ReplyAIModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: t('Close_Button', language), style: ButtonStyle.DANGER },
		{
			actionId: ReplyAIModalEnum.CLOSE_ACTION_ID,
			blockId: ReplyAIModalEnum.CLOSE_BLOCK_ID,
		},
	);
	return {
		id: `${ReplyAIModalEnum.VIEW_ID}`,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: 'Generate Reply',
		},
		blocks,
		close,
		submit,
	};
}
