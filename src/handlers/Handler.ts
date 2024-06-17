import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IHanderParams, IHandler } from '../definition/handlers/IHandler';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { CreateReplyModal } from '../modal/createReplyModal';
import { listReply } from '../modal/listReplyContextualBar';
import { ReplyStorage } from '../storage/ReplyStorage';
import { IReply } from '../definition/reply/IReply';

export class Handler implements IHandler {
	public app: QuickRepliesApp;
	public sender: IUser;
	public room: IRoom;
	public read: IRead;
	public modify: IModify;
	public http: IHttp;
	public persis: IPersistence;
	public roomInteractionStorage: RoomInteractionStorage;
	public triggerId?: string;
	public threadId?: string;

	constructor(params: IHanderParams) {
		this.app = params.app;
		this.sender = params.sender;
		this.room = params.room;
		this.read = params.read;
		this.modify = params.modify;
		this.http = params.http;
		this.persis = params.persis;
		this.triggerId = params.triggerId;
		this.threadId = params.threadId;
		const persistenceRead = params.read.getPersistenceReader();
		this.roomInteractionStorage = new RoomInteractionStorage(
			params.persis,
			persistenceRead,
			params.sender.id,
		);
	}

	public async Create(): Promise<void> {
		const roomId = this.room.id;
		await Promise.all([
			this.roomInteractionStorage.storeInteractionRoomId(roomId),
		]);

		const modal = await CreateReplyModal(
			this.app,
			this.sender,
			this.read,
			this.persis,
			this.modify,
			this.room,
		);

		if (modal instanceof Error) {
			this.app.getLogger().error(modal.message);
			return;
		}

		const triggerId = this.triggerId;

		if (triggerId) {
			await this.modify
				.getUiController()
				.openSurfaceView(modal, { triggerId }, this.sender);
		}
		return;
	}
	public async List(): Promise<void> {
		const roomId = this.room.id;
		await Promise.all([
			this.roomInteractionStorage.storeInteractionRoomId(roomId),
		]);

		const replyStorage = new ReplyStorage(
			this.persis,
			this.read.getPersistenceReader(),
		);

		const userReplies: IReply[] = await replyStorage.getReplyForUser(
			this.sender,
		);

		const contextualBar = await listReply(
			this.app,
			this.sender,
			this.read,
			this.persis,
			this.modify,
			this.room,
			userReplies,
		);

		if (contextualBar instanceof Error) {
			this.app.getLogger().error(contextualBar.message);
			return;
		}
		const triggerId = this.triggerId;
		if (triggerId) {
			await this.modify.getUiController().openSurfaceView(
				contextualBar,
				{
					triggerId,
				},
				this.sender,
			);
		}
	}
	public async Help(): Promise<void> {
		console.log('Help');
	}
	public async Delete(): Promise<void> {
		console.log('Delete');
	}
	public async Edit(): Promise<void> {
		console.log('Edit');
	}
	public async Send(): Promise<void> {
		console.log('Send');
	}
}
