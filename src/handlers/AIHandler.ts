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
import { AISecurity, SecurityLevel } from '../helper/AISecurity';

class AIHandler {
	constructor(
		private app: QuickRepliesApp,
		private http: IHttp,
		private userPreference: IPreference,
	) {}
	private language = this.userPreference.language;
	private aiSecurity = new AISecurity(
		this.userPreference.AIconfiguration.securityLevel,
		this.language
	);

	public async handleResponse(
		user: IUser,
		message: string,
		prompt: string,
	): Promise<string> {
		try {
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

			this.app.getLogger().log(`[AIHandler] Using AI Provider: ${aiProvider}`);

			const combinedInput = this.getPrompt(message, prompt);
			this.app.getLogger().log(`[AIHandler] Combined Input: ${combinedInput}`);

			const validation = this.aiSecurity.validateInput(combinedInput);
			if (!validation.isValid) {
				const errorMessage = validation.error || t('AI_Security_Invalid_Input', this.language);
				this.app.getLogger().log(`[AIHandler] Security validation failed: ${errorMessage}`);
				return errorMessage;
			}

			let response: string;
			switch (aiProvider) {
				case AIProviderEnum.SelfHosted:
				case SettingEnum.SELF_HOSTED_MODEL:
					this.app.getLogger().log('[AIHandler] Using SelfHosted Model');
					response = await this.handleSelfHostedModel(user, combinedInput);
					break;

				case AIProviderEnum.OpenAI:
				case SettingEnum.OPEN_AI:
					this.app.getLogger().log('[AIHandler] Using OpenAI');
					response = await this.handleOpenAI(user, combinedInput);
					break;

				case AIProviderEnum.Gemini:
				case SettingEnum.GEMINI:
					this.app.getLogger().log('[AIHandler] Using Gemini');
					response = await this.handleGemini(user, combinedInput);
					break;

				default:
					const errorMsg =
						this.userPreference.AIusagePreference ===
						AIusagePreferenceEnum.Personal
							? t('AI_Not_Configured_Personal', this.language)
							: t('AI_Not_Configured_Admin', this.language);

					this.app.getLogger().log(`[AIHandler] ${errorMsg}`);
					return errorMsg;
			}

			const responseValidation = this.aiSecurity.validateResponse(response);
			if (!responseValidation.isValid) {
				const errorMessage = responseValidation.error || t('AI_Security_Invalid_Input', this.language);
				this.app.getLogger().log(`[AIHandler] Response validation failed: ${errorMessage}`);
				return errorMessage;
			}

			this.app.getLogger().log(`[AIHandler] Response received and validated`);
			return response;
		} catch (error) {
			this.app.getLogger().log(`[AIHandler] Error in handleResponse: ${error.message}`);
			this.app.getLogger().log(`[AIHandler] Error stack: ${error.stack}`);
			return t('AI_Something_Went_Wrong', this.language);
		}
	}

	private getPrompt(message: string, prompt: string): string {
		const basePrompt = `You are a helpful assistant in a chat application. 
		Please provide a professional and appropriate response to the following message.
		
		Original message: "${message}"
		
		Additional context: "${prompt}"
		
		Guidelines for your response:
		1. Keep the response concise and relevant
		2. Maintain a professional tone
		3. Avoid any inappropriate or offensive content
		4. If the request is inappropriate, respond with a standardized rejection message
		5. Focus on being helpful while maintaining appropriate boundaries
		
		Please provide your response without any additional formatting or quotes.`;

		return basePrompt;
	}

	private async handleSelfHostedModel(
		user: IUser,
		message: string,
	): Promise<string> {
		try {
			const selfHostedModelUrl = await this.app
				.getAccessors()
				.environmentReader.getSettings()
				.getValueById(SettingEnum.SELF_HOSTED_MODEL);

			if (!selfHostedModelUrl) {
				this.app.getLogger().log('[AIHandler] Self-hosted model URL not configured');
				return t('AI_Not_Configured_Admin', this.language);
			}

			const combinedInput = this.getPrompt(message, '');
			this.app.getLogger().log(`[AIHandler] Sending request to self-hosted model: ${combinedInput}`);

			const result = await this.aiSecurity.secureAIRequest(
				combinedInput,
				this.http,
				`${selfHostedModelUrl}/chat/completions`,
				{
					model: 'gpt-3.5-turbo' // Default model for self-hosted
				}
			);

			if (!result.success) {
				this.app.getLogger().log(`[AIHandler] Self-hosted model error: ${result.error}`);
				return result.error || t('AI_Something_Went_Wrong', this.language);
			}

			if (!result.response) {
				this.app.getLogger().log('[AIHandler] Self-hosted model returned empty response');
				return t('AI_Something_Went_Wrong', this.language);
			}

			this.app.getLogger().log(`[AIHandler] Self-hosted model response: ${result.response}`);
			return result.response;
		} catch (error) {
			this.app.getLogger().log(`[AIHandler] Self-hosted model exception: ${error.message}`);
			return t('AI_Something_Went_Wrong', this.language);
		}
	}

	private async handleOpenAI(
		user: IUser,
		input: string,
	): Promise<string> {
		try {
			const { openaikey, openaimodel } = await this.getOpenAIConfig();

			if (!openaikey || !openaimodel) {
				this.app.getLogger().log('[AIHandler] OpenAI settings not configured');
				const errorMsg =
					this.userPreference.AIusagePreference ===
					AIusagePreferenceEnum.Personal
						? t('AI_OpenAI_Model_Not_Configured', this.language)
						: t('AI_Not_Configured_Admin', this.language);

				return errorMsg;
			}

			this.app.getLogger().log(`[AIHandler] Sending request to OpenAI: ${input}`);

			const result = await this.aiSecurity.secureAIRequest(
				input,
				this.http,
				'https://api.openai.com/v1/chat/completions',
				{
					model: openaimodel
				}
			);

			if (!result.success) {
				this.app.getLogger().log(`[AIHandler] OpenAI error: ${result.error}`);
				return result.error || t('AI_Something_Went_Wrong', this.language);
			}

			if (!result.response) {
				this.app.getLogger().log('[AIHandler] OpenAI returned empty response');
				return t('AI_Something_Went_Wrong', this.language);
			}

			this.app.getLogger().log(`[AIHandler] OpenAI response: ${result.response}`);
			return result.response;
		} catch (error) {
			this.app.getLogger().log(`[AIHandler] OpenAI exception: ${error.message}`);
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
		input: string,
	): Promise<string> {
		try {
			const geminiAPIkey = await this.getGeminiAPIKey();

			if (!geminiAPIkey) {
				this.app.getLogger().log('[AIHandler] Gemini API key not configured');
				const errorMsg =
					this.userPreference.AIusagePreference ===
					AIusagePreferenceEnum.Personal
						? t('AI_Gemini_Model_Not_Configured', this.language)
						: t('AI_Not_Configured_Admin', this.language);

				return errorMsg;
			}

			this.app.getLogger().log(`[AIHandler] Sending request to Gemini: ${input}`);

			const result = await this.aiSecurity.secureAIRequest(
				input,
				this.http,
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiAPIkey}`,
				{} // Empty config as we'll format it in secureAIRequest
			);

			if (!result.success) {
				this.app.getLogger().log(`[AIHandler] Gemini error: ${result.error}`);
				return result.error || t('AI_Something_Went_Wrong', this.language);
			}

			if (!result.response) {
				this.app.getLogger().log('[AIHandler] Gemini returned empty response');
				return t('AI_Something_Went_Wrong', this.language);
			}

			this.app.getLogger().log(`[AIHandler] Gemini response: ${result.response}`);
			return result.response;
		} catch (error) {
			this.app.getLogger().log(`[AIHandler] Gemini exception: ${error.message}`);
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
