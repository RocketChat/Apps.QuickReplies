import { ICommandUtilityParams } from '../command/ICommandUtility';

export interface IHandler extends Omit<ICommandUtilityParams, 'params'> {
	CreateReply(): Promise<void>;
	ListReply(): Promise<void>;
	Help(): Promise<void>;
	Configure(): Promise<void>;
}

export type IHanderParams = Omit<ICommandUtilityParams, 'params'>;
