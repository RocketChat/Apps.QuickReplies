import {
	RocketChatAssociationModel,
	RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import {
	IPersistence,
	IPersistenceRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IuserPreferenceStorage } from '../definition/lib/IuserPreferenceStorage';
import {
	AIProviderEnum,
	AIusagePreferenceEnum,
	IPreference,
} from '../definition/helper/userPreference';
import { Language } from '../lib/Translation/translation';

export class UserPreferenceStorage implements IuserPreferenceStorage {
	private userId: string;

	constructor(
		private readonly persistence: IPersistence,
		private readonly persistenceRead: IPersistenceRead,
		userId: string,
	) {
		this.userId = userId;
	}

	public async storeUserPreference(preference: IPreference): Promise<void> {
		const currentPreference = await this.getUserPreference();

		const updatedPreference: IPreference = {
			userId: this.userId,
			language: preference.language || currentPreference.language,
			AIusagePreference:
				preference.AIusagePreference ||
				currentPreference.AIusagePreference,
			AIconfiguration: {
				AIPrompt:
					preference.AIconfiguration.AIPrompt ||
					currentPreference.AIconfiguration.AIPrompt,
				AIProvider:
					preference.AIconfiguration.AIProvider ||
					currentPreference.AIconfiguration.AIProvider,
				openAI: {
					apiKey:
						preference.AIconfiguration.openAI.apiKey ||
						currentPreference.AIconfiguration.openAI.apiKey,
					model:
						preference.AIconfiguration.openAI.model ||
						currentPreference.AIconfiguration.openAI.model,
				},
				gemini: {
					apiKey:
						preference.AIconfiguration.gemini.apiKey ||
						currentPreference.AIconfiguration.gemini.apiKey,
				},
				selfHosted: {
					url:
						preference.AIconfiguration.selfHosted.url ||
						currentPreference.AIconfiguration.selfHosted.url,
				},
			},
		};

		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#preference`,
		);
		await this.persistence.updateByAssociation(
			association,
			{ preference: updatedPreference },
			true,
		);
	}

	public async getUserPreference(): Promise<IPreference> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#preference`,
		);
		const result = (await this.persistenceRead.readByAssociation(
			association,
		)) as Array<{ preference: IPreference }>;
		if (result.length > 0) {
			return result[0].preference;
		} else {
			const preference: IPreference = {
				userId: this.userId,
				language: Language.en,
				AIusagePreference: AIusagePreferenceEnum.Workspace,
				AIconfiguration: {
					AIPrompt: `Keep the  comprehensive clear and concise reply, and ensure it's well-articulated and helpfull`,
					AIProvider: AIProviderEnum.SelfHosted,
					gemini: {
						apiKey: '',
					},
					openAI: {
						apiKey: '',
						model: '',
					},
					selfHosted: {
						url: '',
					},
				},
			};
			return preference;
		}
	}

	public async clearUserPreference(): Promise<void> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#preference`,
		);
		await this.persistence.removeByAssociation(association);
	}
}
