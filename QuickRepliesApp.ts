import {
	IAppAccessors,
	IConfigurationExtend,
	IEnvironmentRead,
	IHttp,
	ILogger,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { QuickCommand } from './src/commands/QuickCommand';
import {
	IUIKitResponse,
	UIKitBlockInteractionContext,
	UIKitViewCloseInteractionContext,
	UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import { ExecuteViewSubmitHandler } from './src/handlers/ExecuteViewSubmitHandler';
import { IAppUtils } from './src/definition/lib/IAppUtils';
import { ElementBuilder } from './src/lib/ElementBuilder';
import { BlockBuilder } from './src/lib/BlockBuilder';
import { ExecuteViewClosedHandler } from './src/handlers/ExecuteViewClosedHandler';
import { ExecuteBlockActionHandler } from './src/handlers/ExecuteBlockActionHandler';
import { QsCommand } from './src/commands/QsCommand';

export class QuickRepliesApp extends App {
	private elementBuilder: ElementBuilder;
	private blockBuilder: BlockBuilder;
	constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
		super(info, logger, accessors);
	}
	public async initialize(
		configuration: IConfigurationExtend,
		_environmentRead: IEnvironmentRead,
	): Promise<void> {
		await configuration.slashCommands.provideSlashCommand(
			new QuickCommand(this),
		);
		await configuration.slashCommands.provideSlashCommand(
			new QsCommand(this),
		);
		this.elementBuilder = new ElementBuilder(this.getID());
		this.blockBuilder = new BlockBuilder(this.getID());
	}
	public getUtils(): IAppUtils {
		return {
			elementBuilder: this.elementBuilder,
			blockBuilder: this.blockBuilder,
		};
	}
	public async executeViewSubmitHandler(
		context: UIKitViewSubmitInteractionContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	) {
		const handler = new ExecuteViewSubmitHandler(
			this,
			read,
			http,
			persistence,
			modify,
			context,
		);

		return await handler.handleActions();
	}
	public async executeViewClosedHandler(
		context: UIKitViewCloseInteractionContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	): Promise<IUIKitResponse> {
		const handler = new ExecuteViewClosedHandler(
			this,
			read,
			http,
			persistence,
			modify,
			context,
		);

		return await handler.handleActions();
	}

	public async executeBlockActionHandler(
		context: UIKitBlockInteractionContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	): Promise<IUIKitResponse> {
		const handler = new ExecuteBlockActionHandler(
			this,
			read,
			http,
			persistence,
			modify,
			context,
		);

		return await handler.handleActions();
	}
}
