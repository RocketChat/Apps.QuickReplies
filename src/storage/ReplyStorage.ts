import {
	IPersistence,
	IPersistenceRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
	RocketChatAssociationModel,
	RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IReply } from '../definition/reply/IReply';

export class ReplyStorage {
	constructor(
		private readonly persistence: IPersistence,
		private readonly persistenceRead: IPersistenceRead,
	) {}

	// Generates a unique ID for each reply based on user ID and a random value
	private createUniqueId(userId: string): string {
		const timestamp = Date.now().toString(36);
		return `${userId}-${timestamp}`;
	}

	// Validates the name and body of the reply
	private validateReply(name: string, body: string): string | null {
		const isNameValid =
			typeof name === 'string' &&
			name.trim().length > 0 &&
			name.length <= 100;
		const isBodyValid =
			typeof body === 'string' &&
			body.trim().length > 0 &&
			body.length <= 1000;

		if (!isNameValid) {
			throw new Error(
				'Invalid name: Name must be a non-empty string with a maximum length of 100 characters.',
			);
		}

		if (!isBodyValid) {
			throw new Error(
				'Invalid body: Body must be a non-empty string with a maximum length of 1000 characters.',
			);
		}

		return null;
	}

	public async createReply(
		user: IUser,
		name: string,
		body: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			this.validateReply(name, body);

			const association: Array<RocketChatAssociationRecord> = [
				new RocketChatAssociationRecord(
					RocketChatAssociationModel.USER,
					user.id,
				),
				new RocketChatAssociationRecord(
					RocketChatAssociationModel.MISC,
					'reply',
				),
			];

			const userPrevReply: IReply[] = await this.getReplyForUser(user);

			userPrevReply.push({
				id: this.createUniqueId(user.id),
				name,
				body,
			});

			await this.persistence.updateByAssociations(
				association,
				userPrevReply,
				true,
			);
			return { success: true };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false, error: error.message };
			}
			console.warn('Create Reply Error: ', error);
			return {
				success: false,
				error: 'Failed to create reply due to an internal error.',
			};
		}
	}

	// Retrieves replies for the user
	public async getReplyForUser(user: IUser): Promise<IReply[]> {
		try {
			const associations: Array<RocketChatAssociationRecord> = [
				new RocketChatAssociationRecord(
					RocketChatAssociationModel.MISC,
					'reply',
				),
				new RocketChatAssociationRecord(
					RocketChatAssociationModel.USER,
					user.id,
				),
			];
			const reply = await this.persistenceRead.readByAssociations(
				associations,
			);
			return reply && reply.length ? (reply[0] as IReply[]) : [];
		} catch (error) {
			console.warn('Get Reply Error :', error);
			return [];
		}
	}
}
