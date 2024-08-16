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
import { replacePlaceholders, sendMessage } from '../helper/message';
import { t } from '../lib/Translation/translation';
import { getUserPreferredLanguage } from '../helper/userPreference';
import { IMessageRaw } from '@rocket.chat/apps-engine/definition/messages';
import { GetMessagesSortableFields } from '@rocket.chat/apps-engine/server/bridges/RoomBridge';

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

		// check if room is direct

		const room = context.getRoom();
		console.log(room);
		if (room.userIds) {
			if (room.userIds.length == 2 && !room.creator) {
				console.log('direct room');
				// console.log('our id ', user.id);
				const receiverId = room.userIds.find((id) => id !== user.id);
				if (receiverId) {
					// console.log(receiverId);
					const receiverUser = await read
						.getUserReader()
						.getById(receiverId);
					// console.log(receiverUser);
					// console.log('after promsie value ');
					const name = receiverUser.name;
					const username = receiverUser.username;
					const email = receiverUser?.emails?.[0]?.address;
					// console.log(email, 'email');
					const replacements = {
						...(name && { name }),
						...(username && { username }),
						...(email && { email }),
					};

					if (reply) {
						const message = replacePlaceholders(
							reply?.body.trim(),
							replacements,
						);
						await sendMessage(
							modify,
							user,
							context.getRoom(),
							message,
						);
					}
				}
			}
		} else {
			// we are in channel with more than 2 user and it have a creator
			//get prev messgae
			// find first message that is not ours
			// console.log('you are in a room');
			const prevmessages: IMessageRaw[] = await read
				.getRoomReader()
				.getMessages(room.id, {});

			const sorted = prevmessages.sort((a, b) => {
				return (
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime()
				);
			});

			// sorted.forEach((val) => {
			// 	console.log(val.sender.username, '---sorted');
			// });

			prevmessages.forEach((val) => {
				console.log(val.sender.username, '---message');
			});
			let differnetId = '';
			for (let i = 0; i < prevmessages.length; i++) {
				if (prevmessages[i].sender._id !== user.id) {
					differnetId = prevmessages[i].sender._id;
				}
			}

			const receiverUser = await read
				.getUserReader()
				.getById(differnetId);

			const name = receiverUser.name;
			const username = receiverUser.username;
			const email = receiverUser?.emails?.[0]?.address;
			const roomName = room.slugifiedName;
			// console.log(email, 'email');
			const replacements = {
				...(name && { name }),
				...(username && { username }),
				...(email && { email }),
				...(roomName && { room: roomName }),
			};

			if (reply) {
				const message = replacePlaceholders(
					reply?.body.trim(),
					replacements,
				);
				await sendMessage(modify, user, context.getRoom(), message);
			}
		}
	}
}
