import {
	ISetting,
	SettingType,
} from '@rocket.chat/apps-engine/definition/settings';

export enum SettingEnum {
	AI_OPTIONS_ID = 'ai-options',
	MODEL_ADDRESS_ID = 'self-hosted-model-address-id',
	OPEN_AI_API_KEY_ID = ' open-ai-api-key-id',
	OPEN_AI_API_MODEL_ID = 'open-ai-api-model-id',
	GEMINI_AI_API_KEY_ID = 'gemini-ai-api-key-id',
	SELF_HOSTED_MODEL = 'self-hosted-model',
	OPEN_AI = 'open-ai',
	GEMINI = 'gemini',
	// Mistral_AI_API_KEY_ID = 'mistral-ai-api-key-id',
	// Mistral_AI_API_MODEL_ID = 'mistral-ai-model-id',
	// MISTRAL = 'mistral',
}

export const settings: Array<ISetting> = [
	{
		id: SettingEnum.AI_OPTIONS_ID,
		type: SettingType.SELECT,
		packageValue: SettingEnum.SELF_HOSTED_MODEL,
		required: true,
		public: false,
		i18nLabel: 'Choose_AI_Model_Label',
		i18nPlaceholder: 'Choose_AI_Model_Placeholder',
		values: [
			{
				key: SettingEnum.SELF_HOSTED_MODEL,
				i18nLabel: 'Self_Hosted_AI_Model',
			},
			{
				key: SettingEnum.OPEN_AI,
				i18nLabel: 'Open_AI',
			},
			{
				key: SettingEnum.GEMINI,
				i18nLabel: 'Gemini_AI',
			},
			// { key: SettingEnum.MISTRAL, i18nLabel: 'Mistral' },
		],
	},
	{
		id: SettingEnum.MODEL_ADDRESS_ID,
		type: SettingType.STRING,
		packageValue: 'http://mistral-7b/v1',
		required: true,
		public: false,
		i18nLabel: 'Self_Hosted_AI_Model_URL_Label',
		i18nPlaceholder: 'Self_Hosted_AI_Model_URL_Placeholder',
	},
	{
		id: SettingEnum.OPEN_AI_API_KEY_ID,
		type: SettingType.PASSWORD,
		packageValue: '',
		required: true,
		public: false,
		i18nLabel: 'Open_AI_API_Key_Label',
		i18nPlaceholder: 'Open_AI_API_Key_Placeholder',
	},
	{
		id: SettingEnum.OPEN_AI_API_MODEL_ID,
		type: SettingType.STRING,
		packageValue: '',
		required: true,
		public: false,
		i18nLabel: 'Open_AI_Model',
		i18nPlaceholder: 'Open_AI_Model_Placeholder',
	},
	{
		id: SettingEnum.GEMINI_AI_API_KEY_ID,
		type: SettingType.PASSWORD,
		packageValue: '',
		required: true,
		public: false,
		i18nLabel: 'Gemini_API_Key_Label',
		i18nPlaceholder: 'Gemini_API_Key_Placeholder',
	},
	// {
	// 	id: SettingEnum.Mistral_AI_API_KEY_ID,
	// 	type: SettingType.PASSWORD,
	// 	packageValue: '',
	// 	required: true,
	// 	public: false,
	// 	i18nLabel: 'Mistral AI API Key',
	// 	i18nPlaceholder: 'Mistral AI API Key',
	// },
	// {
	// 	id: SettingEnum.Mistral_AI_API_MODEL_ID,
	// 	type: SettingType.STRING,
	// 	packageValue: '',
	// 	required: true,
	// 	public: false,
	// 	i18nLabel: 'Mistral AI Model',
	// 	i18nPlaceholder: 'Mistral AI API Model',
	// },
];
