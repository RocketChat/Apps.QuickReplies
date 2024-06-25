import { QuickRepliesApp } from '../../../QuickRepliesApp';
import { InputElementDispatchAction } from '@rocket.chat/ui-kit';
import { Modals } from '../../enum/modals/common/Modal';
import { StaticSelectOptionsParam } from '../../definition/ui-kit/Element/IStaticSelectElement';
import { ElementInteractionParam } from '../../definition/ui-kit/Element/IElementBuilder';

export function DropDownComponent(
	{
		app,
		options,
		placeholder,
		text,
		dispatchActionConfigOnSelect,
		dispatchActionConfigOnInput,
		initialValue,
	}: {
		app: QuickRepliesApp;
		options: StaticSelectOptionsParam;
		placeholder: string;
		text: string;
		dispatchActionConfigOnSelect?: boolean;
		dispatchActionConfigOnInput?: boolean;
		initialValue?: string;
	},
	{ blockId, actionId }: ElementInteractionParam,
) {
	const { elementBuilder, blockBuilder } = app.getUtils();
	const dropDownOption = elementBuilder.createDropDownOptions(options);

	const dispatchActionConfig: Array<InputElementDispatchAction> = [];

	if (dispatchActionConfigOnSelect) {
		dispatchActionConfig.push(Modals.dispatchActionConfigOnSelect);
	}

	if (dispatchActionConfigOnInput) {
		dispatchActionConfig.push(Modals.dispatchActionConfigOnInput);
	}

	const dropDown = elementBuilder.addDropDown(
		{
			placeholder,
			options: dropDownOption,
			dispatchActionConfig,
			initialValue,
		},
		{ blockId, actionId },
	);
	const inputBlock = blockBuilder.createInputBlock({
		text,
		element: dropDown,
		optional: false,
	});

	return inputBlock;
}
