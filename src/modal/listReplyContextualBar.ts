import {
	IModify,
	IPersistence,
	IRead,
	IUIKitSurfaceViewParam,
} from '@rocket.chat/apps-engine/definition/accessors';
import { Block, TextObjectType } from '@rocket.chat/ui-kit';
// import { CommentPage } from '../../enum/modals/CommentPage';
import { UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';

import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { IReply } from '../definition/reply/IReply';
// import { ReplyStorage } from '../storage/ReplyStorage';
// import { IReply } from '../definition/reply/IReply';

export async function listReply(
	app: QuickRepliesApp,
	user: IUser,
	read: IRead,
	persistence: IPersistence,
	modify: IModify,
	room: IRoom,
	userReplies: IReply[],
): Promise<IUIKitSurfaceViewParam> {
	const { elementBuilder, blockBuilder } = app.getUtils();

	const blocks: Block[] = [];

	// let commentText: object | undefined;

	const divider = blockBuilder.createDividerBlock();
	blocks.push(divider);

	console.log(userReplies);

	// const replyStorage = new ReplyStorage(
	// 	this.persistence,
	// 	this.read.getPersistenceReader(),
	// );

	// const result: IReply[] = await replyStorage.getReplyForUser(user);

	// let comments: ICommentInfo[] = [];

	// console.log('result', result);

	userReplies.forEach((reply) => {
		const replyName = blockBuilder.createContextBlock({
			contextElements: [reply.name],
		});

		const replyBody = blockBuilder.createSectionBlock({
			text: reply.body,
		});

		blocks.push(replyName, replyBody, divider);
	});

	// result.forEach((reply) => {
	// const avatarElement = elementBuilder.addImage({
	// 	imageUrl:
	// 		commentInfo.user.avatar_url ||
	// 		`https://open.rocket.chat/avatar/${commentInfo.user.name}}`,
	// 	altText: '',
	// });
	// const userName = `**${commentInfo.user.name}** ${commentInfo.created_time}`;

	// const NameWithCreatedTime = blockBuilder.createContextBlock({
	// 	contextElements: [avatarElement, userName],
	// });

	// const commentSection: SectionBlock = blockBuilder.createSectionBlock({
	// 	text: commentInfo.comment,
	// });

	// 	const ReplyName = blockBuilder.createContextBlock({
	// 		contextElements: [reply.name],
	// 	});

	// 	blocks.push(ReplyName, divider);
	// });

	// const close = elementBuilder.addButton(
	// 	{ text: CommentPage.CLOSE_BUTTON_TEXT, style: ButtonStyle.DANGER },
	// 	{
	// 		actionId: CommentPage.COMMENT_ON_PAGE_CLOSE_ACTION,
	// 		blockId: CommentPage.COMMENT_ON_PAGE_CLOSE_BLOCK,
	// 	},
	// );

	return {
		id: 'list-view',
		// id: CommentPage.VIEW_ID,
		type: UIKitSurfaceType.CONTEXTUAL_BAR,
		title: {
			type: TextObjectType.MRKDWN,
			// text: CommentPage.TITLE,
			text: 'List of replies',
		},
		blocks,
		// close,
	};
}
