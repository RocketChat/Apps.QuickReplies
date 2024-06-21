import {
	IModify,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType, Block } from '@rocket.chat/ui-kit';

// import { concatStrings, uuid } from '../../../lib/utils';
import { IPreference } from '../definition/helper/userPreference';
// import { t } from '../lib/Translation/translation';
import {
	ButtonStyle,
	UIKitSurfaceType,
} from '@rocket.chat/apps-engine/definition/uikit';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { CreateModal } from '../enum/modals/CreateModal';
import { Modals } from '../enum/modals/common/Modal';

export const SetUserPreferenceModalViewIdPrefix =
	'setUserPreferenceLanguageModal';

export async function setUserPreferenceLanguageModal({
	app,
	modify,
	existingPreference,
}: {
	app: QuickRepliesApp;
	modify: IModify;
	existingPreference?: Omit<IPreference, 'userId'>;
}): Promise<IUIKitSurfaceViewParam | Error> {
	// const viewId = concatStrings(
	// 	[SetUserPreferenceModalViewIdPrefix, uuid()],
	// 	'-',
	// );

	console.log('modal');
	const viewId = SetUserPreferenceModalViewIdPrefix;
	const { elementBuilder, blockBuilder } = app.getUtils();

	// blockBuilder.createInputBlock({element:elementBuilder.
	// })

	const blocks: Block[] = [];
	const selectOptions = [
		{ text: 'Option 1', value: '1' },
		{ text: 'Option 2', value: '2' },
		{ text: 'Option 3', value: '3' },
	];
	const dropDownOption = elementBuilder.createDropDownOptions(selectOptions);

	// eslint-disable-next-line prefer-const
	const dropDown = elementBuilder.addDropDown(
		{
			placeholder: 'placeholder',
			options: dropDownOption,
			dispatchActionConfig: [Modals.dispatchActionConfigOnSelect],
		},
		{ blockId: 'blockid', actionId: 'actionID' },
	);
	blocks.push(
		blockBuilder.createInputBlock({
			text: 'drop down',
			element: dropDown,
			optional: false,
		}),
	);

	const submit = elementBuilder.addButton(
		{ text: CreateModal.CREATE, style: ButtonStyle.PRIMARY },
		{
			actionId: CreateModal.SUBMIT_ACTION_ID,
			blockId: CreateModal.SUBMIT_BLOCK_ID,
		},
	);

	const close = elementBuilder.addButton(
		{ text: CreateModal.CLOSE, style: ButtonStyle.DANGER },
		{
			actionId: CreateModal.CLOSE_ACTION_ID,
			blockId: CreateModal.CLOSE_BLOCK_ID,
		},
	);

	return {
		id: viewId,
		type: UIKitSurfaceType.MODAL,
		title: {
			type: TextObjectType.MRKDWN,
			text: CreateModal.TITLE,
		},
		blocks: blocks,
		close,
		submit,
	};
}
