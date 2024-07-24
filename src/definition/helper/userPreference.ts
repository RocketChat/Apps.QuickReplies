import { Language } from '../../lib/Translation/translation';

export interface IPreference {
	userId: string;
	language: Language;
	AIpreference: AIPreferencetype;
}

export type AIPreferencetype =
	| AIpreferenceEnum.Personal
	| AIpreferenceEnum.Workspace;

export enum AIpreferenceEnum {
	Personal = 'Personal',
	Workspace = 'Workspace',
}

export type AIoptionstype =
	| AIoptions.OpenAI
	| AIoptions.Gemini
	| AIoptions.SelfHosted;

export enum AIoptions {
	OpenAI = 'OpenAI',
	Gemini = 'Gemini',
	SelfHosted = 'Self Hosted',
}
