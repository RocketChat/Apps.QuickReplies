import { ICommandUtilityParams } from '../command/ICommandUtility';

export interface IHandler extends Omit<ICommandUtilityParams, 'params'> {
	Create(): Promise<void>;
	List(): Promise<void>;
	Help(): Promise<void>;
	Delete(): Promise<void>;
	Edit(): Promise<void>;
	Send(): Promise<void>;
}

export type IHanderParams = Omit<ICommandUtilityParams, 'params'>;
