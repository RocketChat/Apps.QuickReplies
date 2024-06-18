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
} from '@rocket.chat/ui-kit';
import { PlainTextInputParam } from '../definition/ui-kit/Element/IPlainTextInputElement';

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
}
