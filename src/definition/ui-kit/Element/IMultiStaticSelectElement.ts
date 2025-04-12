import { MultiStaticSelectElement } from '@rocket.chat/ui-kit';

export type MultiStaticSelectElementParam = Pick<
	MultiStaticSelectElement,
	| 'options'
	| 'optionGroups'
	| 'initialOption'
	| 'initialValue'
	| 'dispatchActionConfig'
> & { placeholder: string };

export type MultiStaticSelectOptionsParam = Array<{
	text: string;
	value: string;
	description?: string;
	url?: string;
}>;
