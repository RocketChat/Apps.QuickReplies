import {
	RocketChatAssociationModel,
	RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import {
	IPersistence,
	IPersistenceRead,
	ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { ReplyStorage } from '../storage/ReplyStorage';
import { getDefaultReplies } from '../data/DefaultReplies';
import { Language } from '../lib/Translation/translation';

export class UserInitStorage {
	constructor(
		private readonly persistence: IPersistence,
		private readonly persistenceRead: IPersistenceRead,
		private readonly logger: ILogger,
	) {}

	/**
	 * Check if a user has been initialized with default replies
	 */
	public async isUserInitialized(user: IUser): Promise<boolean> {
		try {
			const association = new RocketChatAssociationRecord(
				RocketChatAssociationModel.USER,
				`${user.id}#initialized_replies`,
			);
			const result = await this.persistenceRead.readByAssociation(association);

			return result && result.length > 0;
		} catch (error) {
			this.logger.error(`Error checking initialization status: ${error}`);
			return false;
		}
	}

	/**
	 * Mark a user as initialized in persistent storage
	 */
	public async markUserAsInitialized(user: IUser): Promise<void> {
		try {
			const association = new RocketChatAssociationRecord(
				RocketChatAssociationModel.USER,
				`${user.id}#initialized_replies`,
			);
			await this.persistence.updateByAssociation(
				association,
				{ initialized: true, timestamp: new Date().toISOString() },
				true
			);
			this.logger.debug(`User ${user.id} marked as initialized in persistence`);
		} catch (error) {
			this.logger.error(`Error marking user as initialized: ${error}`);
		}
	}

	/**
	 * Initialize default quick replies for a user who hasn't used the app before
	 */
	public async initializeDefaultRepliesForUser(user: IUser): Promise<void> {
		try {
			// Check if the user has already been initialized
			if (await this.isUserInitialized(user)) {
				this.logger.debug(`User ${user.id} already initialized, skipping`);
				return;
			}

			const replyStorage = new ReplyStorage(this.persistence, this.persistenceRead);
			const existingReplies = await replyStorage.getReplyForUser(user);

			// Only initialize if the user doesn't have any replies yet
			if (existingReplies.length === 0) {
				const defaultReplies = getDefaultReplies(user.id);

				for (const reply of defaultReplies) {
					await replyStorage.createReply(
						user,
						reply.name,
						reply.body,
						Language.en
					);
				}

				this.logger.info(`Initialized default quick replies for user: ${user.id}`);
			}

			await this.markUserAsInitialized(user);
		} catch (error) {
			this.logger.error(`Error initializing default replies for user: ${error}`);
		}
	}
}
