import {
	IHttp,
	IHttpResponse,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { SettingEnum } from '../config/settings';

class AIHandler {
	constructor(private app: QuickRepliesApp, private http: IHttp) {}

	public async handleResponse(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		const option = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById(SettingEnum.AI_OPTIONS_ID);

		switch (option) {
			case SettingEnum.SELF_HOSTED_MODEL:
				return this.handleSelfHostedModel(user, message, prompt);
			case SettingEnum.OPEN_AI:
				return this.handleOpenAI(user, message, prompt);
			case SettingEnum.MISTRAL:
				return this.handleMistral(user, message, prompt);
			case SettingEnum.GEMINI:
				return this.handleGemini(user, message, prompt);
			default:
				return 'AI not set up. Please contact your administrator';
		}
	}

	private async handleSelfHostedModel(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		const url = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById(SettingEnum.MODEL_ADDRESS_ID);

		const body = {
			messages: [
				{
					role: 'system',
					content: `Write a reply to this message: "${message}". Ensure the reply is good professional and to the point, use the following as prompt or response message: "${prompt}" and make sure you respond with a nice written reply nothing else just reply.`,
				},
			],
			temperature: 0,
		};

		const response: IHttpResponse = await this.http.post(
			`${url}/chat/completions`,
			{
				headers: {
					'Content-Type': 'application/json',
				},
				content: JSON.stringify(body),
			},
		);

		if (!response || !response.data) {
			this.app
				.getLogger()
				.log('Something is wrong with AI. Please try again later');
			return 'Something is wrong with AI. Please try again later';
		}

		const data = response.data;
		return data.choices[0].message.content;
	}

	private async handleOpenAI(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		const openaikey = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById(SettingEnum.OPEN_AI_API_KEY_ID);

		const openaimodel = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById(SettingEnum.OPEN_AI_API_MODEL_ID);

		const response = await this.http.post(
			'https://api.openai.com/v1/chat/completions',
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${openaikey}`,
				},
				content: JSON.stringify({
					model: openaimodel,
					messages: [
						{
							role: 'system',
							content: `Write a reply to this message: "${message}". Ensure the reply is good professional and to the point, use the following as prompt or response message: "${prompt}" and make sure you respond with a nice written reply, nothing else just reply.`,
						},
					],
				}),
			},
		);

		if (!response || !response.data) {
			this.app
				.getLogger()
				.log('Something is wrong with AI. Please try again later');
			return 'Something is wrong with AI. Please try again later';
		}

		console.log(response.data);
		const { choices } = response.data;

		return choices[0].message.content;
	}

	private async handleMistral(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		const mistralaikey = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById(SettingEnum.Mistral_AI_API_KEY_ID);

		const mistralmodel = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById(SettingEnum.Mistral_AI_API_MODEL_ID);

		const response = await this.http.post(
			'https://api.mistral.ai/v1/chat/completions',
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${mistralaikey}`,
				},
				content: JSON.stringify({
					model: mistralmodel,
					messages: [
						{
							role: 'system',
							content: `Write a reply to this message: "${message}". Ensure the reply is short and to the point, following this prompt: "${prompt}" and make sure you just respond with the reply nothing else just reply.`,
						},
					],
				}),
			},
		);

		if (!response || !response.content) {
			this.app
				.getLogger()
				.log('Something is wrong with AI. Please try again later');
			return 'Something is wrong with AI. Please try again later';
		}

		const { choices } = JSON.parse(response.content);
		return choices[0].message.content;
	}

	private async handleGemini(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		const geminiAPIkey = await this.app
			.getAccessors()
			.environmentReader.getSettings()
			.getValueById(SettingEnum.GEMINI_AI_API_KEY_ID);

		const response = await this.http.post(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiAPIkey}`,
			{
				headers: {
					'Content-Type': 'application/json',
				},
				content: JSON.stringify({
					contents: [
						{
							parts: {
								text: `Write a reply to this message: "${message}". Ensure the reply is good professional and to the point, use the following as prompt or response message: "${prompt}" and make sure you respond with a nice written reply nothing else just reply.`,
							},
						},
					],
				}),
			},
		);

		if (!response || !response.content) {
			this.app
				.getLogger()
				.log('Something is wrong with AI. Please try again later');
			return 'Something is wrong with AI. Please try again later';
		}

		const data = response.data;
		console.log(data);
		return data.candidates[0].content.parts[0].text;
	}
}

export default AIHandler;
