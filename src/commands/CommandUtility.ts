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
import { ReplyStorage } from '../storage/ReplyStorage';
import { getUserPreferredLanguage } from '../helper/userPreference';
import { CacheReplyStorage } from '../storage/ReplyCache';

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
			this.app,
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
		});

		if (this.params.length == 0) {
			await handler.sendDefault();
		} else if (this.params.length == 1) {
			await this.handleSingleParam(handler);
		} else {
			const replyStorage = new ReplyStorage(
				this.persis,
				this.read.getPersistenceReader(),
			);

			const replyCache = new CacheReplyStorage(
				this.persis,
				this.read.getPersistenceReader(),
			);

			if (this.params[0].toLocaleLowerCase() === CommandParam.CREATE) {
				const NameParam = this.params[1];
				const BodyParam = this.params.slice(2).join(' ');
				const name = NameParam ? NameParam : '';
				const body = BodyParam ? BodyParam : '';

				await replyCache.setCacheReply(this.sender, {
					id: '1',
					name,
					body,
				});

				await handler.CreateReply(name, body);
			} else if (
				this.params[0].toLocaleLowerCase() === CommandParam.SEND
			) {
				const NameParam = this.params[1];
				const userReplies = await replyStorage.getReplyForUser(
					this.sender,
				);
				const reply = userReplies.find(
					(reply) => reply.name.trim() == NameParam.trim(),
				);
				if (reply) {
					await replyCache.setCacheReply(this.sender, reply);
					await handler.SendReply(reply);
				}
			} else if (
				this.params[0].toLocaleLowerCase() === CommandParam.EDIT
			) {
				const NameParam = this.params[1];
				const BodyParam = this.params.slice(2).join(' ');
				const name = NameParam ? NameParam : '';
				const body = BodyParam ? BodyParam : '';

				const userReplies = await replyStorage.getReplyForUser(
					this.sender,
				);
				const reply = userReplies.find(
					(reply) => reply.name.trim() == name.trim(),
				);

				if (reply) {
					await replyCache.setCacheReply(this.sender, {
						id: reply.id,
						body: body,
						name: reply.name,
					});

					await handler.EditReply(reply, body);
				}
			} else if (
				this.params[0].toLocaleLowerCase() === CommandParam.DELETE
			) {
				const NameParam = this.params[1];
				const userReplies = await replyStorage.getReplyForUser(
					this.sender,
				);
				const reply = userReplies.find(
					(reply) => reply.name.trim() == NameParam.trim(),
				);
				if (reply) {
					replyCache.setCacheReply(this.sender, reply);
					await handler.DeleteReply(reply);
				}
			}
		}
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
			default: {
				await handler.sendDefault();
				break;
			}
		}
	}
}
