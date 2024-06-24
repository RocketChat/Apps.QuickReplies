import {
	SectionBlock,
	ContextBlock,
	InputBlock,
	DividerBlock,
	ActionsBlock,
} from '@rocket.chat/ui-kit';
import { SectionBlockParam } from './ISectionBlock';
import { ContextBlockParam } from './IContextBlock';
import { InputBlockParam } from './IInputBlock';
import { ActionBlockParam } from './IActionBlock';

export interface IBlockBuilder {
	createSectionBlock(param: SectionBlockParam): SectionBlock;
	createContextBlock(param: ContextBlockParam): ContextBlock;
	createActionBlock(param: ActionBlockParam): ActionsBlock;
	createInputBlock(param: InputBlockParam): InputBlock;
	createDividerBlock(blockId?: string): DividerBlock;
}
