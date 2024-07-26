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
		let aiProvider: string;

		if (
			this.userPreference.AIusagePreference ===
			AIusagePreferenceEnum.Personal
		) {
			aiProvider = this.userPreference.AIconfiguration.AIProvider;
		} else {
			aiProvider = await this.app
				.getAccessors()
				.environmentReader.getSettings()
				.getValueById(SettingEnum.AI_PROVIDER_OPTOIN_ID);
		}

		switch (aiProvider) {
			case AIProviderEnum.SelfHosted:
			case SettingEnum.SELF_HOSTED_MODEL:
				return this.handleSelfHostedModel(user, message, prompt);

			case AIProviderEnum.OpenAI:
			case SettingEnum.OPEN_AI:
				return this.handleOpenAI(user, message, prompt);

			case AIProviderEnum.Gemini:
			case SettingEnum.GEMINI:
				return this.handleGemini(user, message, prompt);

			default:
				const errorMsg =
					this.userPreference.AIusagePreference ===
					AIusagePreferenceEnum.Personal
						? 'AI not set up. Please Check your configuration'
						: 'AI not set up. Please contact your administrator';

				this.app.getLogger().log(errorMsg);
				return errorMsg;
		}
	}

	private getPrompt(message: string, prompt: string): string {
		return `Write a reply to this message: "${message}". Ensure the reply is simple. Use the following as a prompt or response reply: "${prompt}" and make sure you respond with a well-written message.`;
	}

	private async handleSelfHostedModel(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
			const url = await this.getSelfHostedModelUrl();

			if (!url) {
				const errorMsg =
					'Your Workspace AI is not set up properly. Please contact your administrator';
				this.app
					.getLogger()
					.log(
						'Model address not set. Please contact your administrator',
					);
				return errorMsg;
			}

			const requestBody = {
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
					content: JSON.stringify(requestBody),
				},
			);

			if (!response || !response.data) {
				this.app.getLogger().log('No response data received from AI.');
				return 'Something went wrong. Please try again later';
			}

			return response.data.choices[0].message.content;
		} catch (error) {
			this.app
				.getLogger()
				.log(`Error in handleSelfHostedModel: ${error.message}`);
			return 'Something went wrong. Please try again later';
		}
	}

	private async getSelfHostedModelUrl(): Promise<string> {
		if (
			this.userPreference.AIusagePreference ===
			AIusagePreferenceEnum.Personal
		) {
			return this.userPreference.AIconfiguration.selfHosted.url;
		} else {
			return await this.app
				.getAccessors()
				.environmentReader.getSettings()
				.getValueById(SettingEnum.SELF_HOSTED_MODEL_ADDRESS_ID);
		}
	}

	private async handleOpenAI(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
			const { openaikey, openaimodel } = await this.getOpenAIConfig();

			if (!openaikey || !openaimodel) {
				const errorMsg =
					'Your Workspace AI is not set up properly. Please contact your administrator';
				this.app
					.getLogger()
					.log(
						'OpenAI settings not set. Please contact your administrator',
					);
				return errorMsg;
			}

			const response: IHttpResponse = await this.http.post(
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

	private async getOpenAIConfig(): Promise<{
		openaikey: string;
		openaimodel: string;
	}> {
		if (
			this.userPreference.AIusagePreference ===
			AIusagePreferenceEnum.Personal
		) {
			return {
				openaikey: this.userPreference.AIconfiguration.openAI.apiKey,
				openaimodel: this.userPreference.AIconfiguration.openAI.model,
			};
		} else {
			const [apikey, model] = await Promise.all([
				this.app
					.getAccessors()
					.environmentReader.getSettings()
					.getValueById(SettingEnum.OPEN_AI_API_KEY_ID),
				this.app
					.getAccessors()
					.environmentReader.getSettings()
					.getValueById(SettingEnum.OPEN_AI_API_MODEL_ID),
			]);
			return { openaikey: apikey, openaimodel: model };
		}
	}
	private async handleGemini(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
			const geminiAPIkey = await this.getGeminiAPIKey();

			if (!geminiAPIkey) {
				const errorMsg =
					'Your Workspace AI is not set up properly. Please contact your administrator';
				this.app
					.getLogger()
					.log(
						'Gemini API key not set. Please contact your administrator',
					);
				return errorMsg;
			}

			const response: IHttpResponse = await this.http.post(
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

	private async getGeminiAPIKey(): Promise<string> {
		if (
			this.userPreference.AIusagePreference ===
			AIusagePreferenceEnum.Personal
		) {
			return this.userPreference.AIconfiguration.gemini.apiKey;
		} else {
			return await this.app
				.getAccessors()
				.environmentReader.getSettings()
				.getValueById(SettingEnum.GEMINI_AI_API_KEY_ID);
		}
	}
}

export default AIHandler;
