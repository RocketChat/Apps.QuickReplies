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
import { ListContextualBar } from '../enum/modals/ListContextualBar';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { CreateModal } from '../enum/modals/CreateModal';

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
			case ListContextualBar.VIEW_ID: {
				// RoomInteraction.clearInteractionRoomId();
				break;
			}
			case CreateModal.VIEW_ID: {
				// RoomInteraction.clearInteractionRoomId();
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
