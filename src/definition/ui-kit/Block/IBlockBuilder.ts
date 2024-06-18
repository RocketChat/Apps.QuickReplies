import {
	SectionBlock,
	ContextBlock,
	InputBlock,
	DividerBlock,
} from '@rocket.chat/ui-kit';
import { SectionBlockParam } from './ISectionBlock';
import { ContextBlockParam } from './IContextBlock';
import { InputBlockParam } from './IInputBlock';

export interface IBlockBuilder {
	createSectionBlock(param: SectionBlockParam): SectionBlock;
	createContextBlock(param: ContextBlockParam): ContextBlock;
	createInputBlock(param: InputBlockParam): InputBlock;
	createDividerBlock(blockId?: string): DividerBlock;
}
