import { ButtonParam } from '../definition/ui-kit/Element/IButtonElement';
import {
	IElementBuilder,
	ElementInteractionParam,
} from '../definition/ui-kit/Element/IElementBuilder';
import { OverflowElementParam } from '../definition/ui-kit/Element/IOverflowElement';
import {
	ButtonElement,
	BlockElementType,
	TextObjectType,
	OverflowElement,
	PlainTextInputElement,
	Option,
	StaticSelectElement,
	MultiStaticSelectElement,
} from '@rocket.chat/ui-kit';
import { PlainTextInputParam } from '../definition/ui-kit/Element/IPlainTextInputElement';
import {
	StaticSelectElementParam,
	StaticSelectOptionsParam,
} from '../definition/ui-kit/Element/IStaticSelectElement';
import {
	MultiStaticSelectElementParam,
	MultiStaticSelectOptionsParam,
} from '../definition/ui-kit/Element/IMultiStaticSelectElement';

export class ElementBuilder implements IElementBuilder {
	constructor(private readonly appId: string) {}
	public addButton(
		param: ButtonParam,
		interaction: ElementInteractionParam,
	): ButtonElement {
		const { text, url, value, style } = param;
		const { blockId, actionId } = interaction;
		const button: ButtonElement = {
			type: BlockElementType.BUTTON,
			text: {
				type: TextObjectType.PLAIN_TEXT,
				text,
			},
			appId: this.appId,
			blockId,
			actionId,
			url,
			value,
			style,
		};
		return button;
	}
	public createPlainTextInput(
		param: PlainTextInputParam,
		interaction: ElementInteractionParam,
	): PlainTextInputElement {
		const {
			text,
			initialValue,
			multiline,
			minLength,
			maxLength,
			dispatchActionConfig,
		} = param;
		const { blockId, actionId } = interaction;
		const plainTextInput: PlainTextInputElement = {
			type: BlockElementType.PLAIN_TEXT_INPUT,
			placeholder: {
				type: TextObjectType.PLAIN_TEXT,
				text,
			},
			appId: this.appId,
			blockId,
			actionId,
			initialValue,
			multiline,
			minLength,
			maxLength,
			dispatchActionConfig,
		};

		return plainTextInput;
	}

	public createOverflow(
		param: OverflowElementParam,
		interaction: ElementInteractionParam,
	): OverflowElement {
		const { options } = param;
		const { blockId, actionId } = interaction;
		const overflow: OverflowElement = {
			type: BlockElementType.OVERFLOW,
			options,
			appId: this.appId,
			blockId,
			actionId,
		};
		return overflow;
	}
	public addDropDown(
		param: StaticSelectElementParam,
		interaction: ElementInteractionParam,
	): StaticSelectElement {
		const {
			placeholder,
			options,
			optionGroups,
			initialOption,
			initialValue,
			dispatchActionConfig,
		} = param;
		const { blockId, actionId } = interaction;
		const dropDown: StaticSelectElement = {
			type: BlockElementType.STATIC_SELECT,
			placeholder: {
				type: TextObjectType.PLAIN_TEXT,
				text: placeholder,
			},
			options,
			optionGroups,
			initialOption,
			initialValue,
			appId: this.appId,
			blockId,
			actionId,
			dispatchActionConfig,
		};
		return dropDown;
	}

	public createDropDownOptions(
		param: StaticSelectOptionsParam,
	): Array<Option> {
		const options: Array<Option> = param.map((option) => {
			const { text, value, description, url } = option;
			const optionObject: Option = {
				text: {
					type: TextObjectType.PLAIN_TEXT,
					text,
				},
				value,
				...(description
					? {
							description: {
								type: TextObjectType.PLAIN_TEXT,
								text: description,
							},
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  }
					: undefined),
				url,
			};
			return optionObject;
		});
		return options;
	}

	public addMultiSelect(
		param: MultiStaticSelectElementParam,
		interaction: ElementInteractionParam,
	): MultiStaticSelectElement {
		const {
			placeholder,
			options,
			optionGroups,
			initialOption,
			initialValue,
			dispatchActionConfig,
		} = param;
		const { blockId, actionId } = interaction;
		const multiSelect: MultiStaticSelectElement = {
			type: BlockElementType.MULTI_STATIC_SELECT,
			placeholder: {
				type: TextObjectType.PLAIN_TEXT,
				text: placeholder,
			},
			options,
			optionGroups,
			initialOption,
			initialValue,
			appId: this.appId,
			blockId,
			actionId,
			dispatchActionConfig,
		};
		return multiSelect;
	}

	public createMultiSelectOptions(
		param: MultiStaticSelectOptionsParam,
	): Array<Option> {
		const options: Array<Option> = param.map((option) => {
			const { text, value, description, url } = option;
			const optionObject: Option = {
				text: {
					type: TextObjectType.PLAIN_TEXT,
					text,
				},
				value,
				...(description
					? {
							description: {
								type: TextObjectType.PLAIN_TEXT,
								text: description,
							},
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  }
					: undefined),
				url,
			};
			return optionObject;
		});
		return options;
	}
}
