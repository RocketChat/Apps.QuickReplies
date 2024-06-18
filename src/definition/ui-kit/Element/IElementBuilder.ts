import {
	ButtonElement,
	OverflowElement,
	PlainTextInputElement,
} from '@rocket.chat/ui-kit';
import { ButtonParam } from './IButtonElement';
import { OverflowElementParam } from './IOverflowElement';
import { PlainTextInputParam } from './IPlainTextInputElement';

export interface IElementBuilder {
	addButton(
		param: ButtonParam,
		interaction: ElementInteractionParam,
	): ButtonElement;
	createPlainTextInput(
		param: PlainTextInputParam,
		interaction: ElementInteractionParam,
	): PlainTextInputElement;
	createOverflow(
		param: OverflowElementParam,
		interaction: ElementInteractionParam,
	): OverflowElement;
}

export type ElementInteractionParam = { blockId: string; actionId: string };
