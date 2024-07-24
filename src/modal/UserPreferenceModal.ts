import {
	IModify,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, Block } from '@rocket.chat/ui-kit';

import {
	ButtonStyle,
	UIKitSurfaceType,
} from '@rocket.chat/apps-engine/definition/uikit';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { Modals } from '../enum/modals/common/Modal';
import {
	Language,
	supportedLanguageList,
	t,
} from '../lib/Translation/translation';
import { SetUserPreferenceModalEnum } from '../enum/modals/setUserPreferenceModal';
import { getLanguageDisplayTextFromCode } from '../helper/userPreference';
import {
	AIoptions,
	AIpreferenceEnum,
	AIPreferencetype,
} from '../definition/helper/userPreference';
import { inputElementComponent } from './common/inputElementComponent';

export async function setUserPreferenceModal({
	app,
	modify,
	existingPreferencelanguage,
	PreferedAI,
	ChoosedAIoption,
}: {
	app: QuickRepliesApp;
	modify: IModify;
	existingPreferencelanguage: Language;
	PreferedAI: AIPreferencetype;
	ChoosedAIoption?: AIoptions;
}): Promise<IUIKitSurfaceViewParam> {
	const viewId = SetUserPreferenceModalEnum.VIEW_ID;
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const LanguageOptions = supportedLanguageList.map((language) => ({
		text: getLanguageDisplayTextFromCode(
			language,
			existingPreferencelanguage,
		),
		value: language,
	}));

	const LanguageDropDownOption =
		elementBuilder.createDropDownOptions(LanguageOptions);

	const LanguageDropDown = elementBuilder.addDropDown(
		{
			placeholder: t('Language', existingPreferencelanguage),
			options: LanguageDropDownOption,
			initialOption: LanguageDropDownOption.find(
				(option) => option.value === existingPreferencelanguage,
			),
			dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
		},
		{
			blockId:
				SetUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_BLOCK_ID,
			actionId:
				SetUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_ACTION_ID,
		},
	);

	blocks.push(
		blockBuilder.createInputBlock({
			text: t('Language', existingPreferencelanguage),
			element: LanguageDropDown,
			optional: false,
		}),
	);

	blocks.push(blockBuilder.createDividerBlock());

	const AIPreferenceOptions = [
		{ text: AIpreferenceEnum.Personal, value: AIpreferenceEnum.Personal },
		{ text: AIpreferenceEnum.Workspace, value: AIpreferenceEnum.Workspace },
	];

	const AIPreferenceDropDownOption =
		elementBuilder.createDropDownOptions(AIPreferenceOptions);

	const AIPrefereneDropDown = elementBuilder.addDropDown(
		{
			placeholder: 'Preferred AI',
			options: AIPreferenceDropDownOption,
			dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
		},
		{
			blockId: 'AI_PREFERENCE_DROPDOWN_BLOCK_ID',
			actionId: 'AI_PREFERENCE_DROPDOWN_ACTION_ID',
		},
	);

	blocks.push(
		blockBuilder.createInputBlock({
			text: 'AI Preference',
			element: AIPrefereneDropDown,
			optional: false,
		}),
	);

	if (PreferedAI === AIpreferenceEnum.Personal) {
		const AIOptions = [
			{
				text: AIoptions.OpenAI,
				value: AIoptions.OpenAI,
			},
			{
				text: AIoptions.Gemini,
				value: AIoptions.Gemini,
			},
			{
				text: AIoptions.SelfHosted,
				value: AIoptions.SelfHosted,
			},
		];

		const AIDropDownOption =
			elementBuilder.createDropDownOptions(AIOptions);

		const AIOptionsDropDown = elementBuilder.addDropDown(
			{
				placeholder: 'Choose AI',
				options: AIDropDownOption,
				dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
			},
			{
				blockId: 'AI_DROPDOWN_BLOCK_ID',
				actionId: 'AI_DROPDOWN_ACTION_ID',
			},
		);

		blocks.push(
			blockBuilder.createInputBlock({
				text: 'AI Options',
				element: AIOptionsDropDown,
				optional: false,
			}),
		);

		if (ChoosedAIoption) {
			switch (ChoosedAIoption) {
				case AIoptions.OpenAI:
					// Handle OpenAI specific logic
					console.log('OpenAI');

					const OpenAIAPIKeyInput = inputElementComponent(
						{
							app,
							placeholder: 'OpenAI API Key',
							label: 'OpenAI API',
							optional: false,
						},
						{
							blockId: 'OPENAI_API_KEY_BLOCK_ID',
							actionId: 'OPENAI_API_KEY_ACTION_ID',
						},
					);

					const OpenAIAPIModelInput = inputElementComponent(
						{
							app,
							placeholder: 'OpenAI Model',
							label: 'OpenAI Model',
							optional: false,
						},
						{
							blockId: 'OPENAI_API_MODEL_BLOCK_ID',
							actionId: 'OPENAI_API_MODEL_ACTION_ID',
						},
					);

					blocks.push(OpenAIAPIKeyInput, OpenAIAPIModelInput);

					break;

				case AIoptions.Gemini:
					// Handle Gemini specific logic
					console.log('Gemini');

					const GeminiAIAPIKeyInput = inputElementComponent(
						{
							app,
							placeholder: 'Gemini API Key',
							label: 'Gemini API',
							optional: false,
						},
						{
							blockId: 'GEMINI_API_KEY_BLOCK_ID',
							actionId: 'GEMINI_API_KEY_ACTION_ID',
						},
					);
					blocks.push(GeminiAIAPIKeyInput);
					break;
				case AIoptions.SelfHosted:
					// Handle SelfHosted specific logic
					console.log('SelfHosted');
					const SelfHostedAIURLInput = inputElementComponent(
						{
							app,
							placeholder: 'Enter Self Hosted AI URL',
							label: ' Self Hosted AI URL',
							optional: false,
						},
						{
							blockId: 'GEMINI_API_KEY_BLOCK_ID',
							actionId: 'GEMINI_API_KEY_ACTION_ID',
						},
					);
					blocks.push(SelfHostedAIURLInput);
					break;

				default:
					break;
			}
		}
	}

	const submit = elementBuilder.addButton(
		{
			text: SetUserPreferenceModalEnum.UPDATE,
			style: ButtonStyle.PRIMARY,
		},
		{
			actionId: SetUserPreferenceModalEnum.SUBMIT_ACTION_ID,
			blockId: SetUserPreferenceModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{
			text: SetUserPreferenceModalEnum.CLOSE,
			style: ButtonStyle.DANGER,
		},
		{
			actionId: SetUserPreferenceModalEnum.CLOSE_ACTION_ID,
			blockId: SetUserPreferenceModalEnum.CLOSE_BLOCK_ID,
		},
	);

	return {
		id: viewId,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: t(
				'Set_User_Preference_Modal_Title',
				existingPreferencelanguage,
			),
		},
		blocks: blocks,
		close,
		submit,
	};
}
