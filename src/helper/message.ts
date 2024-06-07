import { IRead, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageAttachment } from '@rocket.chat/apps-engine/definition/messages';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { Messages } from '../enum/messages';

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
