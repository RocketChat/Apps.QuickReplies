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

export async function setUserPreferenceLanguageModal({
	app,
	modify,
	existingPreferencelanguage,
}: {
	app: QuickRepliesApp;
	modify: IModify;
	existingPreferencelanguage: Language;
}): Promise<IUIKitSurfaceViewParam | Error> {
	const viewId = SetUserPreferenceModalEnum.VIEW_ID;
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	const selectOptions = supportedLanguageList.map((language) => ({
		text: getLanguageDisplayTextFromCode(
			language,
			existingPreferencelanguage,
		),
		value: language,
	}));

	const dropDownOption = elementBuilder.createDropDownOptions(selectOptions);

	const dropDown = elementBuilder.addDropDown(
		{
			placeholder: t('Language', existingPreferencelanguage),
			options: dropDownOption,
			initialOption: dropDownOption.find(
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
			element: dropDown,
			optional: false,
		}),
	);

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

const getLanguageDisplayTextFromCode = (
	code: Language,
	language: Language,
): string => {
	switch (code) {
		case Language.en:
			return t('Language_EN', language);
		case Language.de:
			return t('Language_DE', language);
		case Language.pt:
			return t('Language_PT', language);
		case Language.pl:
			return t('Language_PL', language);
		case Language.ru:
			return t('Language_RU', language);
	}
};
