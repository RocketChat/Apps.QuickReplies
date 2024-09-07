import {
	RocketChatAssociationModel,
	RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import {
	IPersistence,
	IPersistenceRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IReceiverStorage } from '../definition/lib/IReceiverstrorage';

export class Receiverstorage implements IReceiverStorage {
	private userId: string;
	constructor(
		private readonly persistence: IPersistence,
		private readonly persistenceRead: IPersistenceRead,
		userId: string,
	) {
		this.userId = userId;
	}

	public async getReceiverRecord(): Promise<{
		username?: string;
		name?: string;
		room?: string;
		email?: string;
	}> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#ReceiverInfo`,
		);
		const [result] = (await this.persistenceRead.readByAssociation(
			association,
		)) as Array<{
			username?: string;
			name?: string;
			room?: string;
			email?: string;
		}>;

		return result;
	}

	public async setReceiverRecord(record: {
		username?: string;
		name?: string;
		room?: string;
		email?: string;
	}): Promise<void> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#ReceiverInfo`,
		);
		await this.persistence.updateByAssociation(association, record, true);
	}

	public async removeReceiverRecord(): Promise<void> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#ReceiverInfo`,
		);
		await this.persistence.removeByAssociation(association);
	}
}
