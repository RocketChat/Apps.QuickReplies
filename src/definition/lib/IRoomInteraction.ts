export interface IRoomInteractionStorage {
	storeInteractionRoomId(roomId: string): Promise<void>;
	getInteractionRoomId(): Promise<string | undefined>;
	clearInteractionRoomId(): Promise<void>;
}
