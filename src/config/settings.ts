import {
	ISetting,
	SettingType,
} from '@rocket.chat/apps-engine/definition/settings';

export enum SettingEnum {
	MODEL_ADDRESS_ID = 'model-address-id',
}

export const settings: Array<ISetting> = [
	{
		id: SettingEnum.MODEL_ADDRESS_ID,
		type: SettingType.STRING,
		packageValue: 'http://mistral-7b/v1',
		required: true,
		public: true,
		i18nLabel: 'AI Model Address',
		i18nPlaceholder: 'AI Model Address',
		hidden: true,
	},
];
