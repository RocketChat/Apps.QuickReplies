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
import { t } from '../lib/Translation/translation';

class AIHandler {
	constructor(
		private app: QuickRepliesApp,
		private http: IHttp,
		private userPreference: IPreference,
	) {}
	private language = this.userPreference.language;

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
						? t('AI_Not_Configured_Personal', this.language)
						: t('AI_Not_Configured_Admin', this.language);

				this.app.getLogger().log(errorMsg);
				return errorMsg;
		}
	}

	private getPrompt(message: string, prompt: string): string {
		return `Write a reply to this message: "${message}".Reply must be ${this.userPreference.AIconfiguration.AIPromptOptions} Use the as a prompt or response reply: "${prompt}" and make sure you respond with just the reply without quotes.`;
	}

	private async handleSelfHostedModel(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
			const url = await this.getSelfHostedModelUrl();

			if (!url) {
				this.app.getLogger().log('Self Hosted Model address not set.');
				if (
					this.userPreference.AIusagePreference ===
					AIusagePreferenceEnum.Personal
				) {
					return t(
						'AI_Self_Hosted_Model_Not_Configured',
						this.language,
					);
				} else {
					return t(
						'AI_Workspace_Model_Not_Configured',
						this.language,
					);
				}
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
				return t('AI_Something_Went_Wrong', this.language);
			}

			return response.data.choices[0].message.content;
		} catch (error) {
			this.app
				.getLogger()
				.log(`Error in handleSelfHostedModel: ${error.message}`);
			return t('AI_Something_Went_Wrong', this.language);
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
				this.app.getLogger().log('OpenAI settings not set properly.');
				const errorMsg =
					this.userPreference.AIusagePreference ===
					AIusagePreferenceEnum.Personal
						? t('AI_OpenAI_Model_Not_Configured', this.language)
						: t('AI_Not_Configured_Admin', this.language);

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
				return t('AI_Something_Went_Wrong', this.language);
			}

			const { choices } = response.data;
			return choices[0].message.content;
		} catch (error) {
			this.app.getLogger().log(`Error in handleOpenAI: ${error.message}`);
			return t('AI_Something_Went_Wrong', this.language);
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
				this.app.getLogger().log('Gemini API key not set Properly');

				const errorMsg =
					this.userPreference.AIusagePreference ===
					AIusagePreferenceEnum.Personal
						? t('AI_Gemini_Model_Not_Configured', this.language)
						: t('AI_Not_Configured_Admin', this.language);

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
				return t('AI_Something_Went_Wrong', this.language);
			}

			const data = response.data;
			return data.candidates[0].content.parts[0].text;
		} catch (error) {
			this.app.getLogger().log(`Error in handleGemini: ${error.message}`);
			return t('AI_Something_Went_Wrong', this.language);
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
