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
import { CreateReplyModal } from '../modal/createModal';
import { listReplyContextualBar } from '../modal/listContextualBar';
import { ReplyStorage } from '../storage/ReplyStorage';
import { IReply } from '../definition/reply/IReply';
import {
	sendDefaultNotification,
	sendHelperNotification,
} from '../helper/notification';
import { setUserPreferenceModal } from '../modal/UserPreferenceModal';
import {
	getUserPreferredAI,
	getUserPreferredLanguage,
} from '../helper/userPreference';
import { Language } from '../lib/Translation/translation';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { ReplyAIModal } from '../modal/AIreplyModal';
import { AIstorage } from '../storage/AIStorage';

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
	public language: Language;

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
		this.language = params.language;
		const persistenceRead = params.read.getPersistenceReader();
		this.roomInteractionStorage = new RoomInteractionStorage(
			params.persis,
			persistenceRead,
			params.sender.id,
		);
	}

	public async CreateReply(): Promise<void> {
		const modal = await CreateReplyModal(
			this.app,
			this.sender,
			this.read,
			this.persis,
			this.modify,
			this.room,
			this.language,
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
	public async ListReply(): Promise<void> {
		const replyStorage = new ReplyStorage(
			this.persis,
			this.read.getPersistenceReader(),
		);

		const userReplies: IReply[] = await replyStorage.getReplyForUser(
			this.sender,
		);

		const contextualBar = await listReplyContextualBar(
			this.app,
			this.sender,
			this.read,
			this.persis,
			this.modify,
			this.room,
			userReplies,
			this.language,
		);

		if (contextualBar instanceof Error) {
			this.app.getLogger().error(contextualBar.message);
			return;
		}
		const triggerId = this.triggerId;
		if (triggerId) {
			await this.modify
				.getUiController()
				.openSurfaceView(contextualBar, { triggerId }, this.sender);
		}
	}

	public async Help(): Promise<void> {
		await sendHelperNotification(
			this.read,
			this.modify,
			this.sender,
			this.room,
			this.language,
		);
	}
	public async sendDefault(): Promise<void> {
		await sendDefaultNotification(
			this.app,
			this.read,
			this.modify,
			this.sender,
			this.room,
			this.language,
		);
	}
	public async Configure(): Promise<void> {
		const existingPreference = await getUserPreferredLanguage(
			this.read.getPersistenceReader(),
			this.persis,
			this.sender.id,
		);
		const existingAIpreference = await getUserPreferredAI(
			this.read.getPersistenceReader(),
			this.persis,
			this.sender.id,
		);

		const modal = await setUserPreferenceModal({
			app: this.app,
			modify: this.modify,
			existingPreferencelanguage: existingPreference,
			PreferedAI: existingAIpreference,
		});

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
	public async replyUsingAI(message: IMessage): Promise<void> {
		if (message.text) {
			const aistorage = new AIstorage(
				this.persis,
				this.read.getPersistenceReader(),
				this.sender.id,
			);
			aistorage.updateMessage(message.text);
			const modal = await ReplyAIModal(
				this.app,
				this.sender,
				this.read,
				this.persis,
				this.modify,
				this.room,
				this.language,
				message?.text,
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
	}
}
