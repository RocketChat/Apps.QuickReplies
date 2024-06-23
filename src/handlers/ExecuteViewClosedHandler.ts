import {
	IUIKitResponse,
	UIKitViewCloseInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import {
	IHttp,
	IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { listContextualBarEnum } from '../enum/modals/listContextualBar';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { createModalEnum } from '../enum/modals/createModal';
import { CacheReplyStorage } from '../storage/ReplyCache';
import { sendModalEnum } from '../enum/modals/sendModal';

export class ExecuteViewClosedHandler {
	private context: UIKitViewCloseInteractionContext;
	constructor(
		protected readonly app: QuickRepliesApp,
		protected readonly read: IRead,
		protected readonly http: IHttp,
		protected readonly persistence: IPersistence,
		protected readonly modify: IModify,
		context: UIKitViewCloseInteractionContext,
	) {
		this.context = context;
	}

	public async handleActions(): Promise<IUIKitResponse> {
		const { view, user } = this.context.getInteractionData();
		const RoomInteraction = new RoomInteractionStorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);
		switch (view.id) {
			case listContextualBarEnum.VIEW_ID: {
				break;
			}
			case createModalEnum.VIEW_ID: {
				break;
			}
			case sendModalEnum.VIEW_ID: {
				const replyCache = new CacheReplyStorage(
					this.persistence,
					this.read.getPersistenceReader(),
				);
				replyCache.removeCacheReply(user);
				RoomInteraction.clearInteractionRoomId();
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
