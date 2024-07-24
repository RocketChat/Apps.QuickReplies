import {
	RocketChatAssociationModel,
	RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import {
	IPersistence,
	IPersistenceRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IuserPreferenceStorage } from '../definition/lib/IuserPreferenceStorage';
import { IPreference } from '../definition/helper/userPreference';

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
		console.log('storeUserPreference', preference);
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#preference`,
		);
		await this.persistence.updateByAssociation(
			association,
			{ preference: preference },
			true,
		);
	}

	public async getUserPreference(): Promise<IPreference | null> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#preference`,
		);
		const result = (await this.persistenceRead.readByAssociation(
			association,
		)) as Array<{ preference: IPreference }>;
		return result.length > 0 ? result[0].preference : null;
	}

	public async clearUserPreference(): Promise<void> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#preference`,
		);
		await this.persistence.removeByAssociation(association);
	}
}
