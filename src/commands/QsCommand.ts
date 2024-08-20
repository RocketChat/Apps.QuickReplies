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
import {
	getReplacementValues,
	replacePlaceholders,
	sendMessage,
} from '../helper/message';
import { t } from '../lib/Translation/translation';
import { getUserPreferredLanguage } from '../helper/userPreference';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { Replacements } from '../definition/helper/message';

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
		// Placeholder for command execution logic
	}

	public async previewer(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<ISlashCommandPreview> {
		const searchTerm = context.getArguments().join(' ').toLowerCase();
		const userReplies = await this.getUserReplies(
			context.getSender(),
			read,
			persis,
		);
		const language = await getUserPreferredLanguage(
			read.getPersistenceReader(),
			persis,
			context.getSender().id,
		);

		if (!userReplies?.length) {
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
			.filter((reply) => reply.name.toLowerCase().includes(searchTerm))
			.sort((a, b) => this.compareReplies(a, b, searchTerm))
			.slice(0, 5);

		const items = matchedReplies.map((reply) => ({
			id: reply.id,
			type: SlashCommandPreviewItemType.TEXT,
			value:
				reply.name.length + reply.body.length > 35
					? `${reply.name
							.concat(' : ')
							.concat(reply.body)
							.slice(0, 35)}...`
					: `${reply.name.concat(' : ').concat(reply.body)}`,
		}));

		return { i18nTitle: 'Quick_Search_Command_Preview_Title', items };
	}

	public async executePreviewItem(
		item: ISlashCommandPreviewItem,
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<void> {
		const reply = await this.getReplyById(
			context.getSender(),
			item.id,
			read,
			persis,
		);
		if (!reply) return;

		const room = context.getRoom();
		const user = context.getSender();
		const replacements = (await getReplacementValues(
			room,
			user,
			read,
		)) as Replacements;

		const message = replacePlaceholders(reply.body.trim(), replacements);
		await sendMessage(modify, context.getSender(), room, message);
	}

	private async getUserReplies(
		user: IUser,
		read: IRead,
		persis: IPersistence,
	) {
		return await new ReplyStorage(
			persis,
			read.getPersistenceReader(),
		).getReplyForUser(user);
	}

	private compareReplies(a, b, searchTerm) {
		const aNameMatch = a.name.toLowerCase().includes(searchTerm);
		const bNameMatch = b.name.toLowerCase().includes(searchTerm);

		if (aNameMatch && !bNameMatch) return -1;
		if (!aNameMatch && bNameMatch) return 1;
		return a.name.localeCompare(b.name);
	}

	private async getReplyById(
		user,
		replyId: string,
		read: IRead,
		persis: IPersistence,
	) {
		return await new ReplyStorage(
			persis,
			read.getPersistenceReader(),
		).getReplyById(user, replyId);
	}
}
