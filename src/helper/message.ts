import { IRead, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageAttachment } from '@rocket.chat/apps-engine/definition/messages';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { Messages } from '../enum/messages';
import { Block } from '@rocket.chat/ui-kit';

export async function sendHelperNotification(
	read: IRead,
	modify: IModify,
	user: IUser,
	room: IRoom,
): Promise<void> {
	const appUser = (await read.getUserReader().getAppUser()) as IUser;
	const attachment: IMessageAttachment = {
		color: '#000000',
		text: Messages.HELPER_COMMANDS,
	};

	const helperMessage = modify
		.getCreator()
		.startMessage()
		.setRoom(room)
		.setSender(appUser)
		.setText(Messages.HELPER_TEXT)
		.setAttachments([attachment])
		.setGroupable(false);

	return read.getNotifier().notifyUser(user, helperMessage.getMessage());
}

export async function sendNotification(
	read: IRead,
	modify: IModify,
	user: IUser,
	room: IRoom,
	content: { message?: string; blocks?: Array<Block> },
): Promise<void> {
	const appUser = (await read.getUserReader().getAppUser()) as IUser;
	const { message, blocks } = content;
	const messageBuilder = modify
		.getCreator()
		.startMessage()
		.setSender(appUser)
		.setRoom(room)
		.setGroupable(false);

	if (message) {
		messageBuilder.setText(message);
	} else if (blocks) {
		messageBuilder.setBlocks(blocks);
	}
	console.log('notification');
	return read.getNotifier().notifyUser(user, messageBuilder.getMessage());
}
