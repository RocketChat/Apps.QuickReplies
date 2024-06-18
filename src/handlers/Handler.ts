import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IHanderParams, IHandler } from '../definition/handlers/IHandler';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { CreateReplyModal } from '../modal/createReplyModal';
import { listReply } from '../modal/listReplyContextualBar';
import { ReplyStorage } from '../storage/ReplyStorage';
import { IReply } from '../definition/reply/IReply';
import { sendHelperNotification } from '../helper/notification';

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

	private async storeRoomInteractionId(roomId: string): Promise<void> {
		await this.roomInteractionStorage.storeInteractionRoomId(roomId);
	}

	private async openSurfaceView(
		view: IUIKitSurfaceViewParam,
		triggerId?: string,
	): Promise<void> {
		if (triggerId) {
			await this.modify
				.getUiController()
				.openSurfaceView(view, { triggerId }, this.sender);
		}
	}

	public async Create(): Promise<void> {
		const roomId = this.room.id;
		await this.storeRoomInteractionId(roomId);

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

		await this.openSurfaceView(modal, this.triggerId);
	}

	public async List(): Promise<void> {
		const roomId = this.room.id;
		await this.storeRoomInteractionId(roomId);

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

		await this.openSurfaceView(contextualBar, this.triggerId);
	}

	public async Help(): Promise<void> {
		await sendHelperNotification(
			this.read,
			this.modify,
			this.sender,
			this.room,
		);
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
