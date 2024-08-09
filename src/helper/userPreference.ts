import {
	IPersistence,
	IPersistenceRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
	Language,
	supportedLanguageList,
	t,
} from '../lib/Translation/translation';
import { UserPreferenceStorage } from '../storage/userPreferenceStorage';
import { AIusagePreferenceEnum } from '../definition/helper/userPreference';

export const getUserPreferredLanguage = async (
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

export const getLanguageDisplayTextFromCode = (
	code: Language,
	language: Language,
): string => {
	switch (code) {
		case Language.en:
			return t('Language_EN', language);
		case Language.de:
			return t('Language_DE', language);
		case Language.pt:
			return t('Language_PT', language);
		case Language.pl:
			return t('Language_PL', language);
		case Language.ru:
			return t('Language_RU', language);
	}
};

export const getUserPreferredAI = async (
	read: IPersistenceRead,
	persistence: IPersistence,
	userId: string,
): Promise<AIusagePreferenceEnum> => {
	if (!userId) {
		return AIusagePreferenceEnum.Workspace;
	}
	const userPreference = new UserPreferenceStorage(persistence, read, userId);

	const preference = await userPreference.getUserPreference();

	if (preference != null) {
		return AIusagePreferenceEnum.Workspace;
	}

	return AIusagePreferenceEnum.Workspace;
};
