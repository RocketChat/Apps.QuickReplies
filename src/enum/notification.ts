export enum Messages {
	HELPER_COMMANDS = `Use \`/quick create\` to create a new quick reply   \n
 Use \`/quick list\` to list all quick messages  
`,
	HELPER_TEXT = ` I'm Quick Bot 👋 Here are some quick tips to get you started!`,
	DEFAULT_MESSAGE = `I'm Quick Bot 👋 I can help you create quick Reply for yourself. How can I help you?`,
}

export enum OnInstallContent {
	PREVIEW_TITLE = '**QuickReplies App**',
	PREVIEW_DESCRIPTION = "**Installed and Rollin' on your Server!**",
	WELCOMING_MESSAGE = `
        You're all set to experience Speed to send replies faster than ever with quick reply.
        Need some help getting started? Just type \`/quick help\` to access our command list.

        **Swiftly respond** to messages by selecting from pre-written responses. provide faster smoother interactions among users.

        To enable AI features, just head over to the App Settings and provide your credentials to use the AI.

        Thanks for choosing the \`Quick App\`.
        `,

	WELCOME_TEXT = `Welcome to **Quick App** in RocketChat!`,
}

export enum messageActionButton {
	CREATE_REPLY = 'Create Reply',
	CREATE_REPLY_ACTION_ID = 'create-reply-actionId',
	CREATE_REPLY_BLOCK_ID = 'create-reply-blockId',

	LIST_REPLY = 'List all Replies',
	LIST_REPLY_ACTION_ID = 'list-reply-actionId',
	LIST_REPLY_BLOCK_ID = 'list-reply-blockId',

	CONFIGURE_PREFERENCES = 'Configure your Preferences',
	CONFIGURE_PREFERENCES_ACTION_ID = 'configure-preferences-actionId',
	CONFIGURE_PREFERENCES_BLOCK_ID = 'configure-preferences-blockId',

	NEED_MORE = 'Need More?',
	NEED_MORE_ACTION_ID = 'need-more-actionId',
	NEED_MORE_BLOCK_ID = 'need-more-blockId',
}
