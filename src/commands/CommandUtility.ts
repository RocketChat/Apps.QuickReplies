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
import { sendHelperNotification } from '../helper/message';
import {
	ICommandUtility,
	ICommandUtilityParams,
} from '../definition/command/ICommandUtility';

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
		});
		switch (this.params.length) {
			case 0: {
				await sendHelperNotification(
					this.read,
					this.modify,
					this.sender,
					this.room,
				);
				break;
			}
			case 1: {
				await this.handleSingleParam(handler);
				break;
			}
			default: {
				await sendHelperNotification(
					this.read,
					this.modify,
					this.sender,
					this.room,
				);
			}
		}
	}

	private async handleSingleParam(handler: Handler): Promise<void> {
		switch (this.params[0].toLowerCase()) {
			case CommandParam.ADD: {
				await handler.Create();
				break;
			}
			case CommandParam.LIST: {
				await handler.List();
				break;
			}
			case CommandParam.HELP:
			default: {
				await sendHelperNotification(
					this.read,
					this.modify,
					this.sender,
					this.room,
				);
				break;
			}
		}
	}
}
