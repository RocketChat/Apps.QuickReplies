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
import { IAppInfo, RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
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
import { ReplyStorage } from './src/storage/ReplyStorage';
import { getDefaultReplies } from './src/data/DefaultReplies';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { Language } from './src/lib/Translation/translation';

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

	/**
	 * Get the association records for tracking user initialization status
	 */
	private getInitAssociations(userId: string): RocketChatAssociationRecord[] {
		return [
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.USER,
				userId,
			),
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.MISC,
				'initialized_replies'
			),
		];
	}

	/**
	 * Check if a user has been initialized with default replies
	 */
	private async isUserInitialized(user: IUser, read: IRead): Promise<boolean> {
		try {
			const association = this.getInitAssociations(user.id);
			const result = await read.getPersistenceReader().readByAssociations(association);
			return result && result.length > 0;
		} catch (error) {
			this.getLogger().error(`Error checking initialization status: ${error}`);
			return false;
		}
	}

	/**
	 * Mark a user as initialized in persistent storage
	 */
	private async markUserAsInitialized(user: IUser, persistence: IPersistence): Promise<void> {
		try {
			const association = this.getInitAssociations(user.id);
			await persistence.updateByAssociations(
				association,
				{ initialized: true, timestamp: new Date().toISOString() },
				true
			);
			this.getLogger().debug(`User ${user.id} marked as initialized in persistence`);
		} catch (error) {
			this.getLogger().error(`Error marking user as initialized: ${error}`);
		}
	}

	/**
	 * Initialize default quick replies for a user who hasn't used the app before

	 */
	public async initializeDefaultRepliesForUser(
		user: IUser,
		read: IRead,
		persistence: IPersistence
	): Promise<void> {
		try {
			// Check if the user has already been initialized using persistent storage
			if (await this.isUserInitialized(user, read)) {
				this.getLogger().debug(`User ${user.id} already initialized, skipping`);
				return;
			}

			const replyStorage = new ReplyStorage(persistence, read.getPersistenceReader());
			const existingReplies = await replyStorage.getReplyForUser(user);

			// Only initialize if the user doesn't have any replies yet
			if (existingReplies.length === 0) {
				const defaultReplies = getDefaultReplies(user.id);

				for (const reply of defaultReplies) {
					await replyStorage.createReply(
						user,
						reply.name,
						reply.body,
						Language.en
					);
				}

				this.getLogger().info(`Initialized default quick replies for user: ${user.id}`);
			}

			await this.markUserAsInitialized(user, persistence);
		} catch (error) {
			this.getLogger().error(`Error initializing default replies for user: ${error}`);
		}
	}

	public async onInstall(
		context: IAppInstallationContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify
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
