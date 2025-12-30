import type { ScriptData } from '../data';
import notify from '../notify';

export const SUMMARY_FAILED = '<i>Could not parse edit summary.</i>';
export const DIFF_FAILED = '<i>Could not query diff.</i>';
export const PREVIEW_FAILED = '<i>Could not query preview.</i>';

export function handleResult<T>(result: PromiseSettledResult<T>): T | undefined {
	if (result.status === 'fulfilled') {
		return result.value;
	}

	void notify.error(result.reason);
	return undefined;
}

interface CompareResponse {
	compare: {
		body: string;
	};
}

export async function getDiff(api: mw.Api, data: ScriptData, newText: string): Promise<string> {
	const params = {
		action: 'compare',
		fromtitle: data.pageInfo.name,
		toslots: ['main'],
		'totext-main': newText,
		format: 'json',
		formatversion: 2
	};
	const response = (await api.post(params)) as CompareResponse;

	return response.compare.body;
}

interface ParseContentResponse {
	parse: {
		text: string;
	};
}

export async function getContentPreview(api: mw.Api, data: ScriptData, newText: string): Promise<string> {
	const params = {
		action: 'parse',
		title: data.pageInfo.name,
		text: newText,
		prop: ['text'],
		pst: true,
		disablelimitreport: true,
		disableeditsection: true,
		preview: true,
		format: 'json',
		formatversion: 2
	};
	const response = (await api.post(params)) as ParseContentResponse;

	return response.parse.text;
}

interface ParseSummaryResponse {
	parse: {
		parsedsummary: string;
	};
}

export async function getSummaryPreview(api: mw.Api, data: ScriptData, summary: string): Promise<string> {
	const params = {
		action: 'parse',
		title: data.pageInfo.name,
		summary,
		prop: [],
		format: 'json',
		formatversion: '2'
	};
	const response = (await api.post(params)) as ParseSummaryResponse;

	return response.parse.parsedsummary;
}
