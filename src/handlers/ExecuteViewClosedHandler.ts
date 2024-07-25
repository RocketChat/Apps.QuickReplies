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
import { ListContextualBarEnum } from '../enum/modals/listContextualBar';
import { RoomInteractionStorage } from '../storage/RoomInteraction';
import { CreateModalEnum } from '../enum/modals/createModal';
import { SendModalEnum } from '../enum/modals/sendModal';

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
			case ListContextualBarEnum.VIEW_ID: {
				break;
			}
			case CreateModalEnum.VIEW_ID: {
				break;
			}
			case SendModalEnum.VIEW_ID: {
				RoomInteraction.clearInteractionRoomId();
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
