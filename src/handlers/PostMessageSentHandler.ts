import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { UserPreferenceStorage } from '../storage/userPreferenceStorage';
import AIHandler from './AIHandler';
import {
	sendSuggestionNotification,
} from '../helper/notification';
import { getUserPreferredLanguage } from '../helper/userPreference';

export class PostMessageSentHandler {
	constructor(
		private app: QuickRepliesApp,
		private message: IMessage,
		private read: IRead,
		private http: IHttp,
		private persistence: IPersistence,
		private modify: IModify,
	) {}

	public async run(): Promise<void> {
		const { message, read, http, persistence, modify } = this;
		const room = message.room;
		const sender = message.sender;
		const logger = this.app.getLogger();

		try {
			const appUser = await read.getUserReader().getAppUser();
			if (!appUser) {
				logger.log('PostMessageSent: No app user found');
				return;
			}

			if (sender.id === appUser.id) {
				return;
			}

			if (!message.text || message.text.trim().length === 0) {
				return;
			}
			
			if (message.text.startsWith('/')) {
				return;
			}

			const roomMembers = await read.getRoomReader().getMembers(room.id);
			const recipients = roomMembers.filter(
				(member) => member.id !== sender.id && member.id !== appUser.id,
			);

			if (recipients.length === 0) {
				logger.log('PostMessageSent: No recipients found');
				return;
			}

			const roomMessages = await read.getRoomReader().getMessages(room.id);
			const contextMessages = roomMessages
				.filter((msg) => msg.text)
				.slice(-5)
				.map((msg) => `${msg.sender.username}: ${msg.text}`)
				.join('\n');

			if (!contextMessages) {
				logger.log('PostMessageSent: No context messages found');
				return;
			}

			for (const recipient of recipients) {
				const language = await getUserPreferredLanguage(
					read.getPersistenceReader(),
					persistence,
					recipient.id,
				);

				const userPreferenceStorage = new UserPreferenceStorage(
					persistence,
					read.getPersistenceReader(),
					recipient.id,
				);
				const userPreference =
					await userPreferenceStorage.getUserPreference();
					
				if (!userPreference.autoSuggestEnabled) {
					logger.log(`PostMessageSent: Auto-suggest disabled for user ${recipient.username}`);
					continue;
				}

				if (
					!userPreference.AIconfiguration ||
					!userPreference.AIconfiguration.AIProvider
				) {
					logger.log(`PostMessageSent: AI not configured for user ${recipient.username}`);
					continue;
				}

				logger.log(`PostMessageSent: Generating suggestions for user ${recipient.username}`);

				const aiHandler = new AIHandler(this.app, http, userPreference);

				const suggestPrompt =
					`Conversation:\n${contextMessages}\n\n` +
					`Reply as JSON array of 3 short replies (1 sentence each): ["r1","r2","r3"]`;

				const aiResponse = await aiHandler.handleResponse(
					contextMessages,
					suggestPrompt,
				);

				logger.log(`PostMessageSent: AI response received for user ${recipient.username}`);

				let suggestions: string[];
				try {
					const parsed = JSON.parse(aiResponse);
					suggestions = Array.isArray(parsed)
						? parsed.slice(0, 3)
						: [aiResponse];
				} catch {
					suggestions = [aiResponse];
				}

				await sendSuggestionNotification(
					this.app,
					read,
					modify,
					recipient,
					room,
					suggestions,
					language,
					message.threadId,
				);

				logger.log(`PostMessageSent: Suggestion notification sent to user ${recipient.username}`);
			}
		} catch (error) {
			this.app.getLogger().error(`PostMessageSent error: ${error.message}`);
		}
	}
}
