import { IPreference } from '../helper/userPreference';

export interface IuserPreferenceStorage {
	storeUserPreference(preference: IPreference): Promise<void>;
	getUserPreference(): Promise<IPreference | null>;
	clearUserPreference(): Promise<void>;
}
