import {
	IPersistence,
	IPersistenceRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import {
	Language,
	supportedLanguageList,
} from '../lib/Translation/translation';
import { UserPreferenceStorage } from '../storage/userPreferenceStorage';

export const getUserPreferredLanguage = async (
	app: QuickRepliesApp,
	read: IPersistenceRead,
	persistence: IPersistence,
	userId: string,
): Promise<Language> => {
	if (!userId) {
		return Language.en;
	}
	const userPreference = new UserPreferenceStorage(persistence, read, userId);

	const preference = await userPreference.getUserPreference();

	if (preference != null) {
		return isSupportedLanguage(preference.language)
			? preference.language
			: Language.en;
	}

	return Language.en;
};

export const isSupportedLanguage = (language: Language): boolean => {
	return supportedLanguageList.includes(language);
};
