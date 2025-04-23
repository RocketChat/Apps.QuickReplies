import {
	IAppAccessors,
	IAppInstallationContext,
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
	UIKitActionButtonInteractionContext,
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
import {
	IUIActionButtonDescriptor,
	UIActionButtonContext,
} from '@rocket.chat/apps-engine/definition/ui';
import { ActionButton } from './src/enum/modals/common/ActionButtons';
import { ExecuteActionButtonHandler } from './src/handlers/ExecuteActionButtonHandler';
import { settings } from './src/config/settings';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { UserInitStorage } from './src/handlers/UserDefaultReplies';

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

		const listReplyButton: IUIActionButtonDescriptor = {
			actionId: ActionButton.LIST_QUICK_REPLY_ACTION,
			labelI18n: ActionButton.LIST_QUICK_REPLY_ACTION_LABEL,
			context: UIActionButtonContext.MESSAGE_BOX_ACTION,
		};
		const createReplyButton: IUIActionButtonDescriptor = {
			actionId: ActionButton.CREATE_QUICK_REPLY_ACTION,
			labelI18n: ActionButton.CREATE_QUICK_REPLY_ACTION_LABEL,
			context: UIActionButtonContext.MESSAGE_BOX_ACTION,
		};

		const ReplyUsingAI: IUIActionButtonDescriptor = {
			actionId: ActionButton.REPLY_USING_AI_ACTION,
			labelI18n: ActionButton.REPLY_USING_AI_LABEL,
			context: UIActionButtonContext.MESSAGE_ACTION,
		};
		const sendReplyButton: IUIActionButtonDescriptor = {
			actionId: ActionButton.SEND_REPLY_ACTION,
			labelI18n: ActionButton.SEND_REPLY_LABEL,
			context: UIActionButtonContext.MESSAGE_ACTION,
		};

		configuration.ui.registerButton(listReplyButton);
		configuration.ui.registerButton(createReplyButton);
		configuration.ui.registerButton(ReplyUsingAI);
		configuration.ui.registerButton(sendReplyButton);

		await Promise.all(
			settings.map((setting) => {
				configuration.settings.provideSetting(setting);
			}),
		);
	}
	public getUtils(): IAppUtils {
		return {
			elementBuilder: this.elementBuilder,
			blockBuilder: this.blockBuilder,
		};
	}

	public async initializeDefaultRepliesForUser(
		user: IUser,
		read: IRead,
		persistence: IPersistence
	): Promise<void> {
		const userInitStorage = new UserInitStorage(
			persistence,
			read.getPersistenceReader(),
			this.getLogger()
		);

		await userInitStorage.initializeDefaultRepliesForUser(user);
	}

	public async onInstall(
		context: IAppInstallationContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
	): Promise<void> {
		try {
			// Initialize for the admin/installer user
			await this.initializeDefaultRepliesForUser(context.user, read, persistence);
			this.getLogger().info('Successfully initialized default replies for admin during installation');
		} catch (error) {
			this.getLogger().error(`Error in onInstall: ${error}`);
		}
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
		// Check and initialize default replies for the user
		await this.initializeDefaultRepliesForUser(context.getInteractionData().user, read, persistence);

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

	public async executeActionButtonHandler(
		context: UIKitActionButtonInteractionContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify,
	): Promise<IUIKitResponse> {
		// Check and initialize default replies for the user
		await this.initializeDefaultRepliesForUser(context.getInteractionData().user, read, persistence);

		const handler = new ExecuteActionButtonHandler(
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
