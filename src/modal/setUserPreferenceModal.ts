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
import { CreateModalEnum } from '../enum/modals/CreateModal';
import { Modals } from '../enum/modals/common/Modal';
import { Language, t } from '../lib/Translation/translation';
import { setUserPreferenceModalEnum } from '../enum/modals/setUserPreferenceModal';

export async function setUserPreferenceLanguageModal({
	app,
	modify,
	existingPreferencelanguage,
}: {
	app: QuickRepliesApp;
	modify: IModify;
	existingPreferencelanguage: Language;
}): Promise<IUIKitSurfaceViewParam | Error> {
	const viewId = setUserPreferenceModalEnum.VIEW_ID;
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];
	const selectOptions = [
		{
			text: getLanguageDisplayTextFromCode(
				Language.en,
				existingPreferencelanguage,
			),
			value: Language.en,
		},
		{
			text: getLanguageDisplayTextFromCode(
				Language.de,
				existingPreferencelanguage,
			),
			value: Language.de,
		},
		{
			text: getLanguageDisplayTextFromCode(
				Language.pt,
				existingPreferencelanguage,
			),
			value: Language.pt,
		},
	];
	const dropDownOption = elementBuilder.createDropDownOptions(selectOptions);

	const dropDown = elementBuilder.addDropDown(
		{
			placeholder: t('language', existingPreferencelanguage),
			options: dropDownOption,

			initialOption: dropDownOption.find((option) => {
				return option.value === existingPreferencelanguage;
			}),
			dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
		},
		{
			blockId:
				setUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_BLOCK_ID,
			actionId:
				setUserPreferenceModalEnum.LANGUAGE_INPUT_DROPDOWN_ACTION_ID,
		},
	);
	blocks.push(
		blockBuilder.createInputBlock({
			text: t('language', existingPreferencelanguage),
			element: dropDown,
			optional: false,
		}),
	);

	const submit = elementBuilder.addButton(
		{
			text: setUserPreferenceModalEnum.CREATE,
			style: ButtonStyle.PRIMARY,
		},
		{
			actionId: setUserPreferenceModalEnum.SUBMIT_ACTION_ID,
			blockId: setUserPreferenceModalEnum.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{
			text: setUserPreferenceModalEnum.CLOSE,
			style: ButtonStyle.DANGER,
		},
		{
			actionId: setUserPreferenceModalEnum.CLOSE_ACTION_ID,
			blockId: setUserPreferenceModalEnum.CLOSE_BLOCK_ID,
		},
	);

	return {
		id: viewId,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: setUserPreferenceModalEnum.TITLE,
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
		case Language.en: {
			return t('language_en', language);
		}
		case Language.de: {
			return t('language_de', language);
		}
		case Language.pt: {
			return t('language_pt', language);
		}
	}
};
