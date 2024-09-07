export interface IReceiverStorage {
	getReceiverRecord(): Promise<{
		username?: string;
		name?: string;
		room?: string;
		email?: string;
	}>;
	setReceiverRecord({
		username,
		name,
		room,
		email,
	}: {
		username?: string;
		name?: string;
		room?: string;
		email?: string;
	}): Promise<void>;
	removeReceiverRecord(): Promise<void>;
}
