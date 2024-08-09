import {
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, SectionBlock, InputBlock } from '@rocket.chat/ui-kit';

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

	const blocks: (SectionBlock | InputBlock)[] = [];

	const messageText = message.trim();
	const messageblock = blockBuilder.createSectionBlock({
		text: `*${t('Message', language)}*: ${messageText}`,
	});

	const promptInput = inputElementComponent(
		{
			app,
			placeholder: t('Prompt_Input_Placeholder', language),
			label: t('Prompt_Input_Label', language),
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
			text: response
				? t('Regenerate_Button_Text', language)
				: t('Generate_Button_Text', language),
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

	blocks.push(messageblock, promptInput, secitonBlock);

	if (response) {
		const inputReplyBody = inputElementComponent(
			{
				app,
				placeholder: t('Generated_Response_Placeholder', language),
				label: t('Generated_Response_Label', language),
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
		{ text: t('Send_This_Text', language), style: ButtonStyle.PRIMARY },
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
			text: t('Generate_Modal_Title', language),
		},
		blocks,
		close,
		submit,
	};
}
