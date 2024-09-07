import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';

export interface IVisitor {
	name?: string;
	username?: string;
	visitorEmails?: { address: string }[];
}

export interface IRoomWithVisitor extends IRoom {
	visitor?: IVisitor;
}

export type Replacements = {
	username?: string;
	name?: string;
	room?: string;
	email?: string;
};
