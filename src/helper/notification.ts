import { IRead, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageAttachment } from '@rocket.chat/apps-engine/definition/messages';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { MessageActionButton } from '../enum/notification';
import { Block } from '@rocket.chat/ui-kit';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { Language, t } from '../lib/Translation/translation';

export async function sendHelperNotification(
	read: IRead,
	modify: IModify,
	user: IUser,
	room: IRoom,
	language: Language,
): Promise<void> {
	const appUser = (await read.getUserReader().getAppUser()) as IUser;
	const message = `Hey ${user.name}, ${t('helper_text', language)}`;
	const attachment: IMessageAttachment = {
		color: '#000000',
		text: t('helper_commands', language),
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
	language: Language,
): Promise<void> {
	const appUser = (await read.getUserReader().getAppUser()) as IUser;
	const { elementBuilder, blockBuilder } = app.getUtils();

	const text = blockBuilder.createSectionBlock({
		text: `${t('hey', language)} ${user.name}, ${t(
			'default_message',
			language,
		)} \n
`,
	});

	const CreatebuttonElement = elementBuilder.addButton(
		{ text: t('create_reply', language), style: 'primary' },
		{
			blockId: MessageActionButton.CREATE_REPLY_BLOCK_ID,
			actionId: MessageActionButton.CREATE_REPLY_ACTION_ID,
		},
	);

	const ListbuttonElement = elementBuilder.addButton(
		{ text: t('list_reply', language), style: 'primary' },
		{
			blockId: MessageActionButton.LIST_REPLY_BLOCK_ID,
			actionId: MessageActionButton.LIST_REPLY_ACTION_ID,
		},
	);

	const configurebuttonElement = elementBuilder.addButton(
		{ text: t('configure_preferences', language), style: 'secondary' },
		{
			blockId: MessageActionButton.CONFIGURE_PREFERENCES_BLOCK_ID,
			actionId: MessageActionButton.CONFIGURE_PREFERENCES_ACTION_ID,
		},
	);

	const needMorebuttonElement = elementBuilder.addButton(
		{ text: t('need_more', language), style: 'secondary' },
		{
			blockId: MessageActionButton.NEED_MORE_BLOCK_ID,
			actionId: MessageActionButton.NEED_MORE_ACTION_ID,
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
