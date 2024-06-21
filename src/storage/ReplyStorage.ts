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
import { Language, t } from '../lib/Translation/translation';

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
	private validateReply(
		name: string,
		body: string,
		language: Language,
	): { success: boolean; error?: string } {
		if (!name && !body) {
			return {
				success: false,
				error: t('error_fill_fields', language),
			};
		}

		const isNameValid =
			typeof name === 'string' &&
			name.trim().length > 0 &&
			name.length <= 100;
		const isBodyValid =
			typeof body === 'string' &&
			body.trim().length > 0 &&
			body.length <= 1000;

		if (!isNameValid) {
			return {
				success: false,
				error: t('error_reply_name_invalid', language),
			};
		}

		if (!isBodyValid) {
			return {
				success: false,
				error: t('error_reply_body_invalid', language),
			};
		}

		return { success: true };
	}

	// Checks if the reply name is unique for the user
	private async isUniqueReplyName(
		user: IUser,
		name: string,
	): Promise<boolean> {
		const replies = await this.getReplyForUser(user);
		return !replies.some((reply) => reply.name === name);
	}

	// Creates a new reply and stores it
	public async createReply(
		user: IUser,
		name: string,
		body: string,
		language: Language,
	): Promise<{ success: boolean; error?: string }> {
		const validation = this.validateReply(name, body, language);

		if (!validation.success) {
			return validation;
		}

		try {
			if (!(await this.isUniqueReplyName(user, name))) {
				return {
					success: false,
					error: t('error_reply_name_already_exists', language),
				};
			}

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
				error: t('error_fail_internal', language),
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
