import {
	ISlashCommand,
	ISlashCommandPreview,
	ISlashCommandPreviewItem,
	SlashCommandContext,
	SlashCommandPreviewItemType,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import {
	IRead,
	IModify,
	IHttp,
	IPersistence,
} from '@rocket.chat/apps-engine/definition/accessors';
import { getSortedMessages, sendMessage } from '../helper/message';
import AIHandler from '../handlers/AIHandler';
import { UserPreferenceStorage } from '../storage/userPreferenceStorage';
import { sendNotification } from '../helper/notification';
import { t } from '../lib/Translation/translation';
import { getUserPreferredLanguage } from '../helper/userPreference';

export class QrCommand implements ISlashCommand {
	constructor(private readonly app: QuickRepliesApp) {}

	public command = 'qr';
	public i18nDescription = 'Quick_Response_Command_Description';
	public providesPreview = true;
	public i18nParamsExample = 'Quick_Response_Command_Params';

	public async executor(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<void> {
		// Placeholder for command execution logic
	}

	public async previewer(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<ISlashCommandPreview> {
		const sender = context.getSender();
		const room = context.getRoom();
		const prevMessages = await getSortedMessages(room.id, read);
		const language = await getUserPreferredLanguage(
			read.getPersistenceReader(),
			persis,
			context.getSender().id,
		);

		const lastUserMessage = prevMessages.find(message => 
			message.text &&
			message.sender.username !== sender.username
		);

		const userPreference = new UserPreferenceStorage(
			persis,
			read.getPersistenceReader(),
			sender.id,
		);

		const Preference = await userPreference.getUserPreference();
		const AiHandler = new AIHandler(this.app, http, Preference);

		let items = [] as ISlashCommandPreviewItem[];
		if (lastUserMessage?.text) {
			const data = await AiHandler.handleResponse(
				lastUserMessage.text,
				'',
				true,
			);

			if (data.success) {
				const str = data.response;
				const arr = JSON.parse(str);
				items = arr.map((message, index) => ({
					id: (index + 1).toString(),
					type: SlashCommandPreviewItemType.TEXT,
					value: message,
				})) as ISlashCommandPreviewItem[];

				return {
					i18nTitle: 'Quick_Response_Command_Preview_Title',
					items,
				};
			} else {
				await sendNotification(read, modify, sender, room, {
					message: data.response,
				});
				items = [];
				return {
					i18nTitle: 'Quick_Response_Command_Preview_Title',
					items,
				};
			}
		} else {
			const errorMessage = t('No_User_Reply_Found', language);
			await sendNotification(read, modify, sender, room, {
				message: errorMessage,
			});
			items = [];
			return { i18nTitle: 'Quick_Response_Command_Preview_Title', items };
		}
	}

	public async executePreviewItem(
		item: ISlashCommandPreviewItem,
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<void> {
		const room = context.getRoom();
		const message = item.value;
		await sendMessage(modify, context.getSender(), room, message);
	}
}
