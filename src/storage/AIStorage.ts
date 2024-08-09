import {
	RocketChatAssociationModel,
	RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import {
	IPersistence,
	IPersistenceRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IAIstorage } from '../definition/lib/IAIstorage';

export class AIstorage implements IAIstorage {
	private userId: string;
	constructor(
		private readonly persistence: IPersistence,
		private readonly persistenceRead: IPersistenceRead,
		userId: string,
	) {
		this.userId = userId;
	}

	private async getInteractionRecord(): Promise<{
		prompt: string;
		response: string;
		message: string;
	}> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#AIinteraction`,
		);
		const [result] = (await this.persistenceRead.readByAssociation(
			association,
		)) as Array<{ prompt: string; response: string; message: string }>;
		return result || { prompt: '', response: '', message: '' };
	}

	private async storeInteractionRecord(record: {
		prompt: string;
		response: string;
		message: string;
	}): Promise<void> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#AIinteraction`,
		);
		await this.persistence.updateByAssociation(association, record, true);
	}

	public async updatePrompt(prompt: string): Promise<void> {
		const record = await this.getInteractionRecord();
		record.prompt = prompt;
		await this.storeInteractionRecord(record);
	}

	public async updateResponse(response: string): Promise<void> {
		const record = await this.getInteractionRecord();
		record.response = response;
		await this.storeInteractionRecord(record);
	}

	public async updateMessage(message: string): Promise<void> {
		const record = await this.getInteractionRecord();
		record.message = message;
		await this.storeInteractionRecord(record);
	}

	public async getPrompt(): Promise<string> {
		const record = await this.getInteractionRecord();
		return record.prompt;
	}

	public async getResponse(): Promise<string> {
		const record = await this.getInteractionRecord();
		return record.response;
	}

	public async getMessage(): Promise<string> {
		const record = await this.getInteractionRecord();
		return record.message;
	}

	public async clearAIInteraction(): Promise<void> {
		const association = new RocketChatAssociationRecord(
			RocketChatAssociationModel.USER,
			`${this.userId}#AIinteraction`,
		);
		await this.persistence.removeByAssociation(association);
	}
}
