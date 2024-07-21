import {
	IHttp,
	IHttpResponse,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { QuickRepliesApp } from '../../QuickRepliesApp';
import { SettingEnum } from '../config/settings';

const AIresponse = async (
	user: IUser,
	message: string,
	prompt: string,
	http: IHttp,
	app: QuickRepliesApp,
): Promise<string> => {
	const url = await app
		.getAccessors()
		.environmentReader.getSettings()
		.getValueById(SettingEnum.MODEL_ADDRESS_ID);

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

	if (!response.content) {
		app.getLogger().log(
			'Something is wrong with AI. Please try again later',
		);
		throw new Error('Something is wrong with AI. Please try again later');
	}

	const parsedResponse = JSON.parse(response.content);
	return parsedResponse.choices[0].message.content;
};

export default AIresponse;
