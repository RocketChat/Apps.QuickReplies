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
import { ReplyStorage } from '../storage/ReplyStorage';
import { sendMessage } from '../helper/message';
import { t } from '../lib/Translation/translation';
import { getUserPreferredLanguage } from '../helper/userPreference';

export class QsCommand implements ISlashCommand {
	constructor(private readonly app: QuickRepliesApp) {}

	public command = 'qs';
	public i18nDescription = 'Quick_Search_Command_Description';
	public providesPreview = true;
	public i18nParamsExample = 'Quick_Search_Command_Params';

	public async executor(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<void> {
		// This will not get executed
	}

	public async previewer(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<ISlashCommandPreview> {
		const items: ISlashCommandPreviewItem[] = [];
		const searchTerm = context.getArguments().join(' ');
		const user = context.getSender();
		const replyStorage = new ReplyStorage(
			persis,
			read.getPersistenceReader(),
		);
		const userReplies = await replyStorage.getReplyForUser(user);
		const language = await getUserPreferredLanguage(
			read.getPersistenceReader(),
			persis,
			user.id,
		);
		if (!userReplies || userReplies.length === 0) {
			return {
				i18nTitle: 'Quick_Search_Command_Preview_Title',
				items: [
					{
						id: '0',
						type: SlashCommandPreviewItemType.TEXT,
						value: t('No_Quick_Replies_Found', language),
					},
				],
			};
		}

		const matchedReplies = userReplies
			.filter((reply) =>
				reply.name.toLowerCase().includes(searchTerm.toLowerCase()),
			)
			.sort((a, b) => {
				const aNameMatch = a.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
				const bNameMatch = b.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
				if (aNameMatch && !bNameMatch) return -1;
				if (!aNameMatch && bNameMatch) return 1;
				return a.name.localeCompare(b.name);
			})
			.slice(0, 5);

		matchedReplies.forEach((reply) => {
			const messagePreview = `${reply.name}:${reply.body}`;
			const trimmedPreview =
				messagePreview.length > 35
					? messagePreview.slice(0, 35) + '...'
					: messagePreview;
			items.push({
				id: reply.id,
				type: SlashCommandPreviewItemType.TEXT,
				value: trimmedPreview,
			});
		});

		return {
			i18nTitle: 'Quick_Search_Command_Preview_Title',
			items,
		};
	}

	public async executePreviewItem(
		item: ISlashCommandPreviewItem,
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<void> {
		const user = context.getSender();
		const replyStorage = new ReplyStorage(
			persis,
			read.getPersistenceReader(),
		);
		const reply = await replyStorage.getReplyById(user, item.id);
		if (reply) {
			await sendMessage(modify, user, context.getRoom(), reply.body);
		}
	}
}
