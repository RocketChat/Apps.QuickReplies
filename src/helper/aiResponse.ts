import {
	IHttp,
	IHttpResponse,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { SettingEnum } from '../config/settings';

const HandleAIresponse = async (
	user: IUser,
	message: string,
	prompt: string,
	http: IHttp,
	app: QuickRepliesApp,
) => {
	const option = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.AI_OPTIONS_ID);

	switch (option) {
		case SettingEnum.SELF_HOSTED_MODEL:
			return handleSelfHostedModal(user, message, prompt, http, app);
			break;
		case SettingEnum.OPEN_AI:
			return handleOpenAI(user, message, prompt, http, app);
			break;
		case SettingEnum.MISTRAL:
			return handleMistral(user, message, prompt, http, app);
		case SettingEnum.GEMINI:
			return handleGemini(user, message, prompt, http, app);

		default:
			return 'AI not set up. Please contact your administrator';
			break;
	}
};

const handleSelfHostedModal = async (
	user: IUser,
	message: string,
	prompt: string,
	http: IHttp,
	app: QuickRepliesApp,
): Promise<string> => {
	console.log('testing Settings');
	const url = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.MODEL_ADDRESS_ID);

	console.log(url);

	const body = {
		messages: [
			{
				role: 'system',
				content: `Write a reply to this message: "${message}". Ensure the reply is short and to the point, following this prompt: "${prompt}" and make sure you just respond with the reply nothing else just reply.`,
			},
		],
		temperature: 0,
	};

	const response: IHttpResponse = await http.post(`${url}/chat/completions`, {
		headers: {
			'Content-Type': 'application/json',
		},
		content: JSON.stringify(body),
	});

	if (!response || !response.content) {
		app.getLogger().log(
			'Something is wrong with AI. Please try again later',
		);
		return 'Something is wrong with AI. Please try again later';
	}

	const parsedResponse = JSON.parse(response.content);
	return parsedResponse.choices[0].message.content;
};

const handleOpenAI = async (
	user: IUser,
	message: string,
	prompt: string,
	http: IHttp,
	app: QuickRepliesApp,
) => {
	const openaikey = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.OPEN_AI_API_KEY_ID);

	const openaimodal = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.OPEN_AI_API_MODEL_ID);

	console.log(openaikey, openaimodal);
	const response = await http.post(
		'https://api.openai.com/v1/chat/completions',
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaikey}`,
			},
			content: JSON.stringify({
				model: openaimodal,
				messages: [
					{
						role: 'system',
						content: `Write a reply to this message: "${message}". Ensure the reply is short and to the point, following this prompt: "${prompt}" and make sure you just respond with the reply nothing else just reply.`,
					},
				],
			}),
		},
	);
	console.log(response);

	if (!response || !response.content) {
		app.getLogger().log(
			'Something is wrong with AI. Please try again later',
		);
		return 'Something is wrong with AI. Please try again later';
	}

	const { choices } = await JSON.parse(response.content);

	// console.log(JSON.parse(response.content));
	return choices[0].message.content;
	// return 'Open AI';
};

const handleMistral = async (
	user: IUser,
	message: string,
	prompt: string,
	http: IHttp,
	app: QuickRepliesApp,
) => {
	const mistralaikey = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.Mistral_AI_API_KEY_ID);

	const mistralmodel = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.Mistral_AI_API_MODEL_ID);

	console.log(mistralaikey, mistralmodel);
	const response = await http.post(
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
		app.getLogger().log(
			'Something is wrong with AI. Please try again later',
		);
		return 'Something is wrong with AI. Please try again later';
	}

	console.log(response);
	const { choices } = await JSON.parse(response.content);

	return choices[0].message.content;
};

const handleGemini = async (
	user: IUser,
	message: string,
	prompt: string,
	http: IHttp,
	app: QuickRepliesApp,
) => {
	const geminiAPIkey = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.GEMINI_AI_API_KEY_ID);

	console.log('gemini');
	const response = await http.post(
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
		app.getLogger().log(
			'Something is wrong with AI. Please try again later',
		);
		return 'Something is wrong with AI. Please try again later';
	}

	console.log(response);
	const content = await JSON.parse(response.content);
	console.log(content);

	console.log(content.candidates[0].content.parts[0].text);

	return content.candidates[0].content.parts[0].text;
	// return choices[0].message.content;
};

export default HandleAIresponse;
