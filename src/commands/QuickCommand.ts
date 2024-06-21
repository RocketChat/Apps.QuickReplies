import {
	ISlashCommand,
	SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { CommandUtility } from './CommandUtility';
import { ICommandUtilityParams } from '../definition/command/ICommandUtility';

export class QuickCommand implements ISlashCommand {
	constructor(private readonly app: QuickRepliesApp) {}

	public command = 'quick';
	public i18nParamsExample = 'quick_command_params';
	public i18nDescription = 'quick_command_description';
	public providesPreview = false;

	public async executor(
		context: SlashCommandContext,
		read: IRead,
		modify: IModify,
		http: IHttp,
		persis: IPersistence,
	): Promise<void> {
		const params = context.getArguments();
		const sender = context.getSender();
		const room = context.getRoom();
		const triggerId = context.getTriggerId();
		const threadId = context.getThreadId();

		const commandUtilityParams: ICommandUtilityParams = {
			params,
			sender,
			room,
			triggerId,
			threadId,
			read,
			modify,
			http,
			persis,
			app: this.app,
		};

		const commandUtility = new CommandUtility(commandUtilityParams);
		await commandUtility.resolveCommand();
	}
}
