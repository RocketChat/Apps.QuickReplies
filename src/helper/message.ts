import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

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
