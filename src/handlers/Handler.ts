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
		this.roomInteractionStorage.storeInteractionRoomId(roomId);
		const triggerId = this.triggerId;
		if (triggerId) {
			const modal = await CreateReplyModal({
				modify: this.modify,
				read: this.read,
				persistence: this.persis,
				http: this.http,
				// slashcommandcontext: this.context,
			});
			await this.modify
				.getUiController()
				.openModalView(modal, { triggerId }, this.sender);
		} else {
			console.log('invalid Trigger ID !');
		}
	}
	public async List(): Promise<void> {
		console.log('List');
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
