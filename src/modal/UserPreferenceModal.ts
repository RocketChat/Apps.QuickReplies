import {
	IModify,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, InputBlock, DividerBlock } from '@rocket.chat/ui-kit';

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
import { UserPreferenceModalEnum } from '../enum/modals/UserPreferenceModal';
import { getLanguageDisplayTextFromCode } from '../helper/userPreference';
import {
	AIProviderEnum,
	AIusagePreferenceEnum,
	IPreference,
} from '../definition/helper/userPreference';
import { inputElementComponent } from './common/inputElementComponent';
import { SecurityLevel } from '../helper/AISecurity';

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
	const language = existingPreference.language as Language;
	const blocks: (InputBlock | DividerBlock)[] = [];

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
	const PromptInput = inputElementComponent(
		{
			app,
			label: t('AI_Prompt_Input_Label', language),
			placeholder: t('AI_Prompt_Input_Placeholder', language),
			optional: false,
			initialValue: existingPreference?.AIconfiguration?.AIPrompt,
		},
		{
			blockId: UserPreferenceModalEnum.PROMPT_CONFIG_INPUT_BLOCK_ID,
			actionId: UserPreferenceModalEnum.PROMPT_CONFIG_INPUT_ACTION_ID,
		},
	);

	blocks.push(PromptInput);

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
			placeholder: t('Choose_AI_Usage_Preference_Placeholder', language),
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
			text: t('Choose_AI_Usage_Preference_Label', language),
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
				placeholder: t('Choose_AI_Provider_Placeholder', language),
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
				text: t('Choose_AI_Provider_Label', language),
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
							placeholder: t(
								'Open_AI_API_Key_Placeholder',
								language,
							),
							label: t('Open_AI_API_Key_Label', language),
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
							placeholder: t(
								'Open_AI_Model_Placeholder',
								language,
							),
							label: t('Open_AI_Model_Label', language),
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
							placeholder: t(
								'Gemini_API_Key_Placeholder',
								language,
							),
							label: t('Gemini_API_Key_Label', language),
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
							placeholder: t(
								'Self_Hosted_AI_Model_URL_Placeholder',
								language,
							),
							label: t(
								'Self_Hosted_AI_Model_URL_Label',
								language,
							),
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

		const securityLevelOptions = [
			{
				text: SecurityLevel.STRICT,
				value: SecurityLevel.STRICT,
			},
			{
				text: SecurityLevel.MODERATE,
				value: SecurityLevel.MODERATE,
			},
			{
				text: SecurityLevel.RELAXED,
				value: SecurityLevel.RELAXED,
			},
		];

		const securityLevelDropDownOption =
			elementBuilder.createDropDownOptions(securityLevelOptions);

		const securityLevelDropDown = elementBuilder.addDropDown(
			{
				placeholder: t('Choose_Security_Level_Placeholder', language),
				options: securityLevelDropDownOption,
				dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
				initialOption: securityLevelDropDownOption.find(
					(option) =>
						option.value ===
						existingPreference.AIconfiguration?.securityLevel,
				),
			},
			{
				blockId: UserPreferenceModalEnum.SECURITY_LEVEL_DROPDOWN_BLOCK_ID,
				actionId: UserPreferenceModalEnum.SECURITY_LEVEL_DROPDOWN_ACTION_ID,
			},
		);

		blocks.push(
			blockBuilder.createInputBlock({
				text: t('Choose_Security_Level_Label', language),
				element: securityLevelDropDown,
				optional: false,
			}),
		);
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
			text: t('User_Preference_Title', language),
		},
		blocks: blocks,
		close: closeButton,
		submit: submitButton,
	};
}
