import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { CommandParam } from '../enum/CommandParam';
import { Handler } from '../handlers/Handler';
import {
	ICommandUtility,
	ICommandUtilityParams,
} from '../definition/command/ICommandUtility';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { getUserPreferredLanguage } from '../helper/userPreference';

export class CommandUtility implements ICommandUtility {
	public app: QuickRepliesApp;
	public params: Array<string>;
	public sender: IUser;
	public room: IRoom;
	public read: IRead;
	public modify: IModify;
	public http: IHttp;
	public persis: IPersistence;
	public triggerId?: string;
	public threadId?: string;

	constructor(props: ICommandUtilityParams) {
		this.app = props.app;
		this.params = props.params;
		this.sender = props.sender;
		this.room = props.room;
		this.read = props.read;
		this.modify = props.modify;
		this.http = props.http;
		this.persis = props.persis;
		this.triggerId = props.triggerId;
		this.threadId = props.threadId;
	}

	public async resolveCommand(): Promise<void> {
		const language = await getUserPreferredLanguage(
			this.read.getPersistenceReader(),
			this.persis,
			this.sender.id,
		);
		const roomInteractionStorage = new RoomInteractionStorage(
			this.persis,
			this.read.getPersistenceReader(),
			this.sender.id,
		);
		roomInteractionStorage.storeInteractionRoomId(this.room.id);

		const handler = new Handler({
			app: this.app,
			sender: this.sender,
			room: this.room,
			read: this.read,
			modify: this.modify,
			http: this.http,
			persis: this.persis,
			triggerId: this.triggerId,
			threadId: this.threadId,
			language,
			params: this.params,
		});

		if (this.params.length === 0) {
			await handler.sendDefault();
			return;
		}
		await this.handleSingleParam(handler);
	}

	private async handleSingleParam(handler: Handler): Promise<void> {
		switch (this.params[0].toLowerCase()) {
			case CommandParam.CREATE: {
				await handler.CreateReply();
				break;
			}
			case CommandParam.LIST: {
				await handler.ListReply();
				break;
			}
			case CommandParam.HELP:
				await handler.Help();
				break;
			case CommandParam.CONFIG:
				await handler.Configure();
				break;
			case CommandParam.AI:
				await handler.replyUsingAI();
				break;
			case CommandParam.GRAMMAR:
				await handler.CorrectGrammarUsingAI();
				break;
			default: {
				await handler.sendDefault();
				break;
			}
		}
	}
}
