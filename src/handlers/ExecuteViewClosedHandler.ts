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
import { SendModalEnum } from '../enum/modals/sendModal';
import { ReplyAIModalEnum } from '../enum/modals/AIreplyModal';
import { AIstorage } from '../storage/AIStorage';
import { Receiverstorage } from '../storage/ReceiverStorage';

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
		const aistorage = new AIstorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);
		const receiverStorage = new Receiverstorage(
			this.persistence,
			this.read.getPersistenceReader(),
			user.id,
		);

		const ViewData = view.id.split('---');
		const ViewLegnth = ViewData.length;
		const viewId = ViewData[0].trim();
		if (ViewLegnth === 1) {
			switch (viewId) {
				case ListContextualBarEnum.VIEW_ID: {
					await receiverStorage.removeReceiverRecord();
					await RoomInteraction.clearInteractionRoomId();

					break;
				}

				case ReplyAIModalEnum.VIEW_ID: {
					await aistorage.clearAIInteraction();
					break;
				}
			}
		} else if (ViewLegnth === 2) {
			switch (viewId) {
				case SendModalEnum.VIEW_ID: {
					break;
				}
			}
		}

		return this.context.getInteractionResponder().successResponse();
	}
}
