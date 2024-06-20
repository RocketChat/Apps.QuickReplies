import { IRead, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageAttachment } from '@rocket.chat/apps-engine/definition/messages';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { Messages, messageActionButton } from '../enum/notification';
import { Block } from '@rocket.chat/ui-kit';
import { QuickRepliesApp } from '../../QuickRepliesApp';

export async function sendHelperNotification(
	read: IRead,
	modify: IModify,
	user: IUser,
	room: IRoom,
): Promise<void> {
	const appUser = (await read.getUserReader().getAppUser()) as IUser;
	const message = `Hey ${user.name}, ${Messages.HELPER_TEXT}`;
	const attachment: IMessageAttachment = {
		color: '#000000',
		text: Messages.HELPER_COMMANDS,
	};

	const helperMessage = modify
		.getCreator()
		.startMessage()
		.setRoom(room)
		.setSender(appUser)
		.setText(message)
		.setAttachments([attachment])
		.setGroupable(false);

	return read.getNotifier().notifyUser(user, helperMessage.getMessage());
}

export async function sendDefaultNotification(
	app: QuickRepliesApp,
	read: IRead,
	modify: IModify,
	user: IUser,
	room: IRoom,
): Promise<void> {
	const appUser = (await read.getUserReader().getAppUser()) as IUser;
	const { elementBuilder, blockBuilder } = app.getUtils();

	const text = blockBuilder.createSectionBlock({
		text: `Hello ${user.name}, ${Messages.DEFAULT_MESSAGE} \n
`,
	});

	const CreatebuttonElement = elementBuilder.addButton(
		{ text: messageActionButton.CREATE_REPLY, style: 'primary' },
		{
			blockId: messageActionButton.CREATE_REPLY_BLOCK_ID,
			actionId: messageActionButton.CREATE_REPLY_ACTION_ID,
		},
	);

	const ListbuttonElement = elementBuilder.addButton(
		{ text: messageActionButton.LIST_REPLY, style: 'primary' },
		{
			blockId: messageActionButton.LIST_REPLY_BLOCK_ID,
			actionId: messageActionButton.LIST_REPLY_ACTION_ID,
		},
	);

	const configurebuttonElement = elementBuilder.addButton(
		{ text: messageActionButton.CONFIGURE_PREFERENCES, style: 'secondary' },
		{
			blockId: messageActionButton.CONFIGURE_PREFERENCES_BLOCK_ID,
			actionId: messageActionButton.CONFIGURE_PREFERENCES_ACTION_ID,
		},
	);

	const needMorebuttonElement = elementBuilder.addButton(
		{ text: messageActionButton.NEED_MORE, style: 'secondary' },
		{
			blockId: messageActionButton.NEED_MORE_BLOCK_ID,
			actionId: messageActionButton.NEED_MORE_ACTION_ID,
		},
	);

	const buttonAction = blockBuilder.createActionBlock({
		elements: [
			CreatebuttonElement,
			ListbuttonElement,
			configurebuttonElement,
			needMorebuttonElement,
		],
	});

	const blocks = [text, buttonAction];

	const helperMessage = modify
		.getCreator()
		.startMessage()
		.setRoom(room)
		.setSender(appUser)
		.setText(Messages.HELPER_TEXT)
		.setGroupable(false)
		.setBlocks(blocks);

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
	return read.getNotifier().notifyUser(user, messageBuilder.getMessage());
}
