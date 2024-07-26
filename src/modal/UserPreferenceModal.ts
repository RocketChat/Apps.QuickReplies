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
import { supportedLanguageList, t } from '../lib/Translation/translation';
import { UserPreferenceModalEnum } from '../enum/modals/UserPreferenceModal';
import { getLanguageDisplayTextFromCode } from '../helper/userPreference';
import {
	AIProviderEnum,
	AIusagePreferenceEnum,
	IPreference,
} from '../definition/helper/userPreference';
import { inputElementComponent } from './common/inputElementComponent';

export async function UserPreferenceModal({
	app,
	modify,
	existingPreference,
}: {
	app: QuickRepliesApp;
	modify: IModify;
	existingPreference: IPreference;
}): Promise<IUIKitSurfaceViewParam> {
	const viewId = UserPreferenceModalEnum.VIEW_ID;
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const languageOptions = supportedLanguageList.map((language) => ({
		text: getLanguageDisplayTextFromCode(
			language,
			existingPreference.language,
		),
		value: language,
	}));

	const languageDropDownOption =
		elementBuilder.createDropDownOptions(languageOptions);

	const languageDropDown = elementBuilder.addDropDown(
		{
			placeholder: t('Language', existingPreference.language),
			options: languageDropDownOption,
			initialOption: languageDropDownOption.find(
				(option) => option.value === existingPreference.language,
			),
			dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
		},
		{
			blockId: UserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_BLOCK_ID,
			actionId: UserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_ACTION_ID,
		},
	);

	blocks.push(
		blockBuilder.createInputBlock({
			text: t('Language', existingPreference.language),
			element: languageDropDown,
			optional: false,
		}),
	);

	blocks.push(blockBuilder.createDividerBlock());

	const AIusagePreferenceOptions = [
		{
			text: AIusagePreferenceEnum.Personal,
			value: AIusagePreferenceEnum.Personal,
		},
		{
			text: AIusagePreferenceEnum.Workspace,
			value: AIusagePreferenceEnum.Workspace,
		},
	];

	const AIusagePreferenceDropDownOption =
		elementBuilder.createDropDownOptions(AIusagePreferenceOptions);

	const AIusagePreferenceDropDown = elementBuilder.addDropDown(
		{
			placeholder: 'Choose AI Preference',
			options: AIusagePreferenceDropDownOption,
			initialOption: AIusagePreferenceDropDownOption.find(
				(option) =>
					option.value === existingPreference.AIusagePreference,
			),
			dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
		},
		{
			blockId: UserPreferenceModalEnum.AI_PREFERENCE_DROPDOWN_BLOCK_ID,
			actionId: UserPreferenceModalEnum.AI_PREFERENCE_DROPDOWN_ACTION_ID,
		},
	);

	blocks.push(
		blockBuilder.createInputBlock({
			text: 'AI Usage Preference',
			element: AIusagePreferenceDropDown,
			optional: false,
		}),
	);

	if (
		existingPreference.AIusagePreference === AIusagePreferenceEnum.Personal
	) {
		const aiProviderOptions = [
			{
				text: AIProviderEnum.OpenAI,
				value: AIProviderEnum.OpenAI,
			},
			{
				text: AIProviderEnum.Gemini,
				value: AIProviderEnum.Gemini,
			},
			{
				text: AIProviderEnum.SelfHosted,
				value: AIProviderEnum.SelfHosted,
			},
		];

		const aiProviderDropDownOption =
			elementBuilder.createDropDownOptions(aiProviderOptions);

		const aiProviderDropDown = elementBuilder.addDropDown(
			{
				placeholder: 'Choose AI Provider',
				options: aiProviderDropDownOption,
				dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
				initialOption: aiProviderDropDownOption.find(
					(option) =>
						option.value ===
						existingPreference.AIconfiguration?.AIProvider,
				),
			},
			{
				blockId: UserPreferenceModalEnum.AI_OPTION_DROPDOWN_BLOCK_ID,
				actionId: UserPreferenceModalEnum.AI_OPTION_DROPDOWN_ACTION_ID,
			},
		);

		blocks.push(
			blockBuilder.createInputBlock({
				text: 'AI Provider',
				element: aiProviderDropDown,
				optional: false,
			}),
		);

		if (existingPreference.AIconfiguration?.AIProvider) {
			switch (existingPreference.AIconfiguration?.AIProvider) {
				case AIProviderEnum.OpenAI:
					const openAIAPIKeyInput = inputElementComponent(
						{
							app,
							placeholder: 'OpenAI API Key',
							label: 'OpenAI API',
							optional: false,
							initialValue:
								existingPreference?.AIconfiguration?.openAI
									?.apiKey,
						},
						{
							blockId:
								UserPreferenceModalEnum.OPEN_AI_API_KEY_BLOCK_ID,
							actionId:
								UserPreferenceModalEnum.OPEN_AI_API_KEY_ACTION_ID,
						},
					);

					const openAIModelInput = inputElementComponent(
						{
							app,
							placeholder: 'OpenAI Model',
							label: 'OpenAI Model',
							optional: false,
							initialValue:
								existingPreference?.AIconfiguration?.openAI
									?.model,
						},
						{
							blockId:
								UserPreferenceModalEnum.OPEN_AI_MODEL_BLOCK_ID,
							actionId:
								UserPreferenceModalEnum.OPEN_AI_MODEL_ACTION_ID,
						},
					);

					blocks.push(openAIAPIKeyInput, openAIModelInput);
					break;

				case AIProviderEnum.Gemini:
					const geminiAPIKeyInput = inputElementComponent(
						{
							app,
							placeholder: 'Gemini API Key',
							label: 'Gemini API',
							optional: false,
							initialValue:
								existingPreference?.AIconfiguration?.gemini
									?.apiKey,
						},
						{
							blockId:
								UserPreferenceModalEnum.GEMINI_API_KEY_BLOCK_ID,
							actionId:
								UserPreferenceModalEnum.GEMINI_API_KEY_ACTION_ID,
						},
					);
					blocks.push(geminiAPIKeyInput);
					break;

				case AIProviderEnum.SelfHosted:
					const selfHostedURLInput = inputElementComponent(
						{
							app,
							placeholder: 'Enter Self Hosted AI URL',
							label: 'Self Hosted AI URL',
							optional: false,
							initialValue:
								existingPreference?.AIconfiguration?.selfHosted
									?.url,
						},
						{
							blockId:
								UserPreferenceModalEnum.SELF_HOSTED_URL_BLOCK_ID,
							actionId:
								UserPreferenceModalEnum.SELF_HOSTED_URL_ACTION_ID,
						},
					);
					blocks.push(selfHostedURLInput);
					break;

				default:
					break;
			}
		}
	}

	const submitButton = elementBuilder.addButton(
		{
			text: UserPreferenceModalEnum.UPDATE,
			style: ButtonStyle.PRIMARY,
		},
		{
			actionId: UserPreferenceModalEnum.SUBMIT_ACTION_ID,
			blockId: UserPreferenceModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const closeButton = elementBuilder.addButton(
		{
			text: UserPreferenceModalEnum.CLOSE,
			style: ButtonStyle.DANGER,
		},
		{
			actionId: UserPreferenceModalEnum.CLOSE_ACTION_ID,
			blockId: UserPreferenceModalEnum.CLOSE_BLOCK_ID,
		},
	);

	return {
		id: viewId,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: 'Set User Preference Modal',
		},
		blocks: blocks,
		close: closeButton,
		submit: submitButton,
	};
}
