import {
	// IModify,
	IPersistence,
	IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationRecord, RocketChatAssociationModel } from '@rocket.chat/apps-engine/definition/metadata';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

// export class ReplyStorage {
// 	constructor(
// 		protected readonly read: IRead,
// 		protected readonly modify: IModify,
// 		protected readonly persistence: IPersistence,

// 	) {}
// }

const assoc = new RocketChatAssociationRecord(
    RocketChatAssociationModel.MISC,
    "reply"
);



export async function StoreReply(
	name: string,
	body: string,
	read: IRead,
	persistence: IPersistence,
	user: IUser,
) {
	// handle invalid logic
	// WE nEED A CALSS  BASED ARCH here
	// Also we have to handle the group feature in future
}
