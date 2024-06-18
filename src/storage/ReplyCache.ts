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

export class CacheReplyStorage {
	constructor(
		private readonly persistence: IPersistence,
		private readonly persistenceRead: IPersistenceRead,
	) {}

	private getAssociations(userId: string): RocketChatAssociationRecord[] {
		return [
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.USER,
				userId,
			),
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.MISC,
				'replyCache',
			),
		];
	}

	public async setCacheReply(
		user: IUser,
		reply: IReply,
	): Promise<{ success: boolean }> {
		try {
			const association = this.getAssociations(user.id);

			await this.persistence.updateByAssociations(
				association,
				reply,
				true,
			);
			return { success: true };
		} catch (error) {
			console.warn('Create Cache Reply Error: ', error);
			return {
				success: false,
			};
		}
	}

	public async getCacheReply(user: IUser): Promise<IReply> {
		try {
			const associations = this.getAssociations(user.id);
			const reply = await this.persistenceRead.readByAssociations(
				associations,
			);
			if (reply?.length < 1) {
				console.warn('No Cache Reply Found', reply);
				throw new Error('No Cache Reply Found');
			}

			return reply[0] as IReply;
		} catch (error) {
			console.warn('Get Cache Reply Error:', error);
			throw new Error('Error while fetching Cache reply');
		}
	}

	public async removeCacheReply(user: IUser): Promise<{ success: boolean }> {
		try {
			const association = this.getAssociations(user.id);
			await this.persistence.removeByAssociations(association);
			return { success: true };
		} catch (error) {
			console.warn('Remove Cache Reply Error:', error);
			return {
				success: false,
			};
		}
	}
}
