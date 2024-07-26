import {
	IHttp,
	IHttpResponse,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { SettingEnum } from '../config/settings';
import {
	AIProviderEnum,
	AIusagePreferenceEnum,
	IPreference,
} from '../definition/helper/userPreference';

class AIHandler {
	constructor(
		private app: QuickRepliesApp,
		private http: IHttp,
		private userPreference: IPreference,
	) {}

	public async handleResponse(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		let option = '';

		if (
			this.userPreference.AIusagePreference ===
			AIusagePreferenceEnum.Personal
		) {
			option = this.userPreference.AIconfiguration.AIProvider;
			switch (option) {
				case AIProviderEnum.SelfHosted:
					return this.handleSelfHostedModel(user, message, prompt);
				case AIProviderEnum.OpenAI:
					return this.handleOpenAI(user, message, prompt);
				case AIProviderEnum.Gemini:
					return this.handleGemini(user, message, prompt);
				default:
					this.app
						.getLogger()
						.log('AI not set up. Please Check your configuration');
					return 'AI not set up. Please Check your configuration';
			}
		} else {
			option = await this.app
				.getAccessors()
				.environmentReader.getSettings()
				.getValueById(SettingEnum.AI_OPTIONS_ID);

			switch (option) {
				case SettingEnum.SELF_HOSTED_MODEL:
					return this.handleSelfHostedModel(user, message, prompt);
				case SettingEnum.OPEN_AI:
					return this.handleOpenAI(user, message, prompt);
				case SettingEnum.GEMINI:
					return this.handleGemini(user, message, prompt);
				default:
					this.app
						.getLogger()
						.log(
							'AI not set up. Please contact your administrator',
						);
					return 'AI not set up. Please contact your administrator';
			}
		}
	}

	private getPrompt(message: string, prompt: string): string {
		return `Write a reply to this message: "${message}". Ensure the reply is simple. Use the following as a prompt or response reply: "${prompt}" and make sure you respond with a well-written reply only dont try to make it long make it short can to the point , nothing else.`;
	}

	private async handleSelfHostedModel(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
			let url = '';
			if (
				this.userPreference.AIusagePreference ===
				AIusagePreferenceEnum.Personal
			) {
				url = this.userPreference.AIconfiguration.selfHosted.url;
			} else {
				url = await this.app
					.getAccessors()
					.environmentReader.getSettings()
					.getValueById(SettingEnum.MODEL_ADDRESS_ID);
			}

			console.log('Handled AI using URL ', url);

			if (!url) {
				this.app
					.getLogger()
					.log(
						'Model address not set. Please contact your administrator',
					);
				return 'Your Workspace AI is not setup properly. Please contact your administrator';
			}

			const body = {
				messages: [
					{
						role: 'system',
						content: this.getPrompt(message, prompt),
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
				this.app.getLogger().log('No response data received from AI.');
				return 'Something went wrong. Please try again later';
			}

			const data = response.data;
			return data.choices[0].message.content;
		} catch (error) {
			this.app
				.getLogger()
				.log(`Error in handleSelfHostedModel: ${error.message}`);
			return 'Something went wrong. Please try again later';
		}
	}

	private async handleOpenAI(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
			let openaikey = '';
			let openaimodel = '';
			if (
				this.userPreference.AIusagePreference ===
				AIusagePreferenceEnum.Personal
			) {
				openaikey = this.userPreference.AIconfiguration.openAI.apiKey;
				openaimodel = this.userPreference.AIconfiguration.openAI.model;
			} else {
				openaikey = await this.app
					.getAccessors()
					.environmentReader.getSettings()
					.getValueById(SettingEnum.OPEN_AI_API_KEY_ID);
				openaimodel = await this.app
					.getAccessors()
					.environmentReader.getSettings()
					.getValueById(SettingEnum.OPEN_AI_API_MODEL_ID);
			}

			console.log('Handled AI using OpenAI ', openaikey, openaimodel);

			if (!openaikey || !openaimodel) {
				this.app
					.getLogger()
					.log(
						'OpenAI settings not set. Please contact your administrator',
					);
				return 'Your Workspace AI is not setup properly. Please contact your administrator';
			}

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
								content: this.getPrompt(message, prompt),
							},
						],
					}),
				},
			);

			if (!response || !response.data) {
				this.app.getLogger().log('No response data received from AI.');
				return 'Something is wrong with AI. Please try again later';
			}

			const { choices } = response.data;
			return choices[0].message.content;
		} catch (error) {
			this.app.getLogger().log(`Error in handleOpenAI: ${error.message}`);
			return 'Something went wrong. Please try again later';
		}
	}

	private async handleGemini(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
			let geminiAPIkey = '';

			if (
				this.userPreference.AIusagePreference ===
				AIusagePreferenceEnum.Personal
			) {
				geminiAPIkey =
					this.userPreference.AIconfiguration.gemini.apiKey;
			} else {
				geminiAPIkey = await this.app
					.getAccessors()
					.environmentReader.getSettings()
					.getValueById(SettingEnum.GEMINI_AI_API_KEY_ID);
			}

			console.log('Handled AI using Gemini ', geminiAPIkey);
			if (!geminiAPIkey) {
				this.app
					.getLogger()
					.log(
						'Gemini API key not set. Please contact your administrator',
					);
				return 'Your Workspace AI is not setup properly. Please contact your administrator';
			}

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
									text: this.getPrompt(message, prompt),
								},
							},
						],
					}),
				},
			);

			if (!response || !response.content) {
				this.app
					.getLogger()
					.log('No response content received from AI.');
				return 'Something is wrong with AI. Please try again later';
			}

			const data = response.data;
			return data.candidates[0].content.parts[0].text;
		} catch (error) {
			this.app.getLogger().log(`Error in handleGemini: ${error.message}`);
			return 'Something went wrong. Please try again later';
		}
	}
}

export default AIHandler;
