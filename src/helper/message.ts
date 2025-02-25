import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageRaw } from '@rocket.chat/apps-engine/definition/messages';
import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoomWithVisitor, Replacements } from '../definition/helper/message';

export async function sendMessage(
	modify: IModify,
	user: IUser,
	room: IRoom,
	message: string,
	threadId?: string,
): Promise<void> {
	const messageBuilder = modify
		.getCreator()
		.startMessage()
		.setSender(user)
		.setRoom(room)
		.setGroupable(false)
		.setParseUrls(true);

	if (message) {
		messageBuilder.setText(message);
	}

	if (threadId) {
		messageBuilder.setThreadId(threadId);
	}

	await modify.getCreator().finish(messageBuilder);
	return;
}

export function replacePlaceholders(
	message: string,
	replacements: Replacements,
): string {
	return message.replace(/\[([^\]]+)\]/g, (match, p1) => {
		// eslint-disable-next-line no-prototype-builtins
		return replacements.hasOwnProperty(p1)
			? replacements[p1 as keyof Replacements] ?? match
			: match;
	});
}

export async function getReplacementValues(
	room: IRoom,
	user: IUser,
	read: IRead,
): Promise<Replacements> {
	switch (room.type) {
		case RoomType.CHANNEL:
			return await buildChannelMessageReplacements(user, room, read);
		case RoomType.DIRECT_MESSAGE:
			return await buildDirectMessageReplacements(user, room, read);
		case RoomType.LIVE_CHAT:
			return await buildLiveChatMessageReplacements(user, room, read);
		case RoomType.PRIVATE_GROUP:
			return await buildPrivateMessageReplacements(user, room, read);
	}
}

async function buildDirectMessageReplacements(
	user: IUser,
	room: IRoom,
	read: IRead,
) {
	if (room.userIds) {
		const receiverId = room?.userIds.find((id) => id !== user.id) as string;
		const receiverUser = await read.getUserReader().getById(receiverId);

		return {
			...(receiverUser?.name && { name: receiverUser.name }),
			...(receiverUser?.username && { username: receiverUser.username }),
			...(receiverUser?.emails?.[0]?.address && {
				email: receiverUser.emails[0].address,
			}),
		};
	} else {
		return {};
	}
}

async function buildChannelMessageReplacements(
	user: IUser,
	room: IRoom,
	read: IRead,
) {
	const prevMessages = await getSortedMessages(room.id, read);
	const receiverUser = await getFirstNonSender(prevMessages, user, read);
	if (!receiverUser) {
		return {};
	}

	return {
		...(receiverUser?.name && { name: receiverUser.name }),
		...(receiverUser?.username && { username: receiverUser.username }),
		...(receiverUser?.emails?.[0]?.address && {
			email: receiverUser.emails[0].address,
		}),
		...(room.slugifiedName && { room: room.slugifiedName }),
	};
}

async function buildLiveChatMessageReplacements(
	user: IUser,
	room: IRoom,
	read: IRead,
) {
	const roomWithVisitor = room as IRoomWithVisitor;

	if (roomWithVisitor.visitor) {
		return {
			...(roomWithVisitor.visitor.name && {
				name: roomWithVisitor.visitor.name,
			}),
			...(roomWithVisitor.visitor.username && {
				username: roomWithVisitor.visitor.username,
			}),
			...(roomWithVisitor.visitor.visitorEmails?.[0]?.address && {
				email: roomWithVisitor.visitor.visitorEmails[0].address,
			}),
		};
	} else {
		return {};
	}
}

async function buildPrivateMessageReplacements(
	user: IUser,
	room: IRoom,
	read: IRead,
) {
	const prevMessages = await getSortedMessages(room.id, read);
	const receiverUser = await getFirstNonSender(prevMessages, user, read);
	if (!receiverUser) {
		return {};
	}

	return {
		...(receiverUser?.name && { name: receiverUser.name }),
		...(receiverUser?.username && { username: receiverUser.username }),
		...(receiverUser?.emails?.[0]?.address && {
			email: receiverUser.emails[0].address,
		}),
		...(room.slugifiedName && { room: room.slugifiedName }),
	};
}

export async function getSortedMessages(roomId: string, read: IRead) {
	const prevMessages: IMessageRaw[] = await read
		.getRoomReader()
		.getMessages(roomId, {});

	return prevMessages.sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

async function getFirstNonSender(messages: IMessageRaw[], sender, read: IRead) {
	const differnetId = messages.find(
		(message) => message.sender._id !== sender.id,
	)?.sender._id;
	if (differnetId) {
		return await read.getUserReader().getById(differnetId);
	} else {
		return undefined;
	}
}
