import { Language } from '../../lib/Translation/translation';
import { ICommandUtilityParams } from '../command/ICommandUtility';
import { IReply } from '../reply/IReply';

export interface IHandler extends Omit<ICommandUtilityParams, 'params'> {
	CreateReply(): Promise<void>;
	ListReply(): Promise<void>;
	Help(): Promise<void>;
	Configure(): Promise<void>;
	SendReply(reply: IReply): Promise<void>;
	EditReply(reply: IReply): Promise<void>;
	DeleteReply(reply: IReply, body?: string): Promise<void>;
}

export type IHanderParams = Omit<ICommandUtilityParams, 'params'> & {
	language: Language;
};
