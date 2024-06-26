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

export enum MessageActionButton {
	CREATE_REPLY_ACTION_ID = 'create-reply-actionId',
	CREATE_REPLY_BLOCK_ID = 'create-reply-blockId',

	LIST_REPLY_ACTION_ID = 'list-reply-actionId',
	LIST_REPLY_BLOCK_ID = 'list-reply-blockId',

	CONFIGURE_PREFERENCES_ACTION_ID = 'configure-preferences-actionId',
	CONFIGURE_PREFERENCES_BLOCK_ID = 'configure-preferences-blockId',

	NEED_MORE_ACTION_ID = 'need-more-actionId',
	NEED_MORE_BLOCK_ID = 'need-more-blockId',
}
