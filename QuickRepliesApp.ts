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
import {IAppInfo, RocketChatAssociationModel, RocketChatAssociationRecord} from '@rocket.chat/apps-engine/definition/metadata';
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
import { IReply } from './src/definition/reply/IReply';

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

	private getAssociations(userId: string): RocketChatAssociationRecord[] {
		return [
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.USER,
				userId,
			),
			new RocketChatAssociationRecord(
				RocketChatAssociationModel.MISC,
				'reply',
			),
		];
	}

	public async onInstall(
		context: IAppInstallationContext,
		read: IRead,
		http: IHttp,
		persistence: IPersistence,
		modify: IModify
	): Promise<void> {
		try {

			const quickReplies: IReply[] = [
				{
					name: 'Greeting',
					body: 'Hello! How may I assist you today?',
					id: `${context.user.id}-${(Date.now() - 10).toString(36)}`,
				},
				{
					name: 'Acknowledgment',
					body: 'Thank you for reaching out. I will get back to you shortly.',
					id: `${context.user.id}-${(Date.now() - 5).toString(36)}`,
				},
				{
					name: 'Follow-up',
					body: 'I wanted to follow up on our previous discussion. Please let me know how you’d like to proceed.',
					id: `${context.user.id}-${Date.now().toString(36)}`,
				},
				{
					name: 'Apology',
					body: 'I sincerely apologize for any inconvenience. We are looking into this and will resolve it as soon as possible.',
					id: `${context.user.id}-${(Date.now() + 5).toString(36)}`,
				},
				{
					name: 'Closing',
					body: 'It was a pleasure assisting you. Please feel free to reach out for any further queries.',
					id: `${context.user.id}-${(Date.now() + 10).toString(36)}`,
				},
			];						

			const association = this.getAssociations(context.user.id);

			const storedReplies = await read.getPersistenceReader().readByAssociations(association);
			if (storedReplies.length > 0) {
				this.getLogger().info('Quick replies already exist. Skipping initialization.');
				return;
			}

			await persistence.updateByAssociations(
				association,
				quickReplies,
				true
			);
	
			this.getLogger().info('Pre-built quick replies initialized successfully.');
		} catch (error) {
			this.getLogger().error(`Error initializing pre-built replies: ${error}`);
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
