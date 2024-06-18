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

	private createUniqueId(userId: string): string {
		const timestamp = Date.now().toString(36);
		return `${userId}-${timestamp}`;
	}

	private validateReply(name: string, body: string): void {
		if (
			typeof name !== 'string' ||
			name.trim().length === 0 ||
			name.length > 100
		) {
			throw new Error(
				'Invalid name: Name must be a non-empty string with a maximum length of 100 characters.',
			);
		}
		if (
			typeof body !== 'string' ||
			body.trim().length === 0 ||
			body.length > 1000
		) {
			throw new Error(
				'Invalid body: Body must be a non-empty string with a maximum length of 1000 characters.',
			);
		}
	}

	private getAssociations(userId: string): RocketChatAssociationRecord[] {
		return [
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.USER,
				userId,
			),
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.MISC,
				'reply',
			),
		];
	}

	public async createReply(
		user: IUser,
		name: string,
		body: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			this.validateReply(name, body);

			const association = this.getAssociations(user.id);
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
			console.warn('Create Reply Error: ', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to create reply due to an internal error.',
			};
		}
	}

	public async getReplyForUser(user: IUser): Promise<IReply[]> {
		try {
			const associations = this.getAssociations(user.id);
			const reply = await this.persistenceRead.readByAssociations(
				associations,
			);
			return reply && reply.length ? (reply[0] as IReply[]) : [];
		} catch (error) {
			console.warn('Get Reply Error:', error);
			return [];
		}
	}

	public async getReplyById(
		user: IUser,
		replyId: string,
	): Promise<IReply | null> {
		const userReplies = await this.getReplyForUser(user);
		return userReplies.find((reply) => reply.id === replyId) || null;
	}

	public async updateReplyById(
		user: IUser,
		replyId: string,
		name: string,
		body: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			this.validateReply(name, body);

			const userReplies = await this.getReplyForUser(user);
			const replyIndex = userReplies.findIndex(
				(reply) => reply.id === replyId,
			);

			if (replyIndex === -1) {
				return { success: false, error: 'Reply not found' };
			}

			userReplies[replyIndex] = { id: replyId, name, body };

			const association = this.getAssociations(user.id);
			await this.persistence.updateByAssociations(
				association,
				userReplies,
				true,
			);
			return { success: true };
		} catch (error) {
			console.warn('Update Reply Error: ', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to update reply due to an internal error.',
			};
		}
	}

	public async deleteReplyById(
		user: IUser,
		replyId: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			const userReplies = await this.getReplyForUser(user);
			const replyIndex = userReplies.findIndex(
				(reply) => reply.id === replyId,
			);

			if (replyIndex === -1) {
				return { success: false, error: 'Reply not found' };
			}

			userReplies.splice(replyIndex, 1);

			const association = this.getAssociations(user.id);
			await this.persistence.updateByAssociations(
				association,
				userReplies,
				true,
			);
			return { success: true };
		} catch (error) {
			console.warn('Delete Reply Error: ', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete reply due to an internal error.',
			};
		}
	}
}
