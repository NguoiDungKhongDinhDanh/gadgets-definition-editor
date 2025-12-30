import constants from './constants';
import type { UnparseSettings } from './unparse';
import { defaultUnparseSettings } from './unparse';

// For attribution: https://stackoverflow.com/a/59298465
type Immutable<T> = {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	readonly [K in keyof T]: T[K] extends Function ? T[K] : Immutable<T[K]>;
};

interface LanguageInfo {
	readonly code: string;
	readonly nameInSelf: string;
	readonly nameInEnglish: string;
	readonly direction: 'ltr' | 'rtl';
}

interface PageInfo {
	readonly name: string;
	readonly revisionID: string | undefined;
	readonly content: string;
}

type SkinCode = string;

interface SkinInfo {
	code: SkinCode;
	name: string;
	default?: boolean;
	unusable?: boolean;
}

type NamespaceID = string;

interface NamespaceData {
	id: number;
	case: 'first-letter' | 'case-sensitive';
	name: string;
	subpages: boolean;
	content: boolean;
	nonincludable: boolean;
	canonical?: string;
	namespaceprotection?: string;
	defaultcontentmodel?: string;
}

type PermissionName = string;
type GroupName = string;

interface PermissionInfo {
	groups: GroupName[];
	users: number;
}

interface _ScriptData {
	pageInfo: PageInfo;

	contentModels: string[];
	namespaces: Map<NamespaceID, NamespaceData>;
	localPermissions: Map<PermissionName, PermissionInfo>;
	allPermissions: PermissionName[];
	skins: Map<SkinCode, SkinInfo>;

	languageInfo: LanguageInfo;

	unparseSettings: UnparseSettings;
}
export type ScriptData = {
	[K in keyof _ScriptData]: K extends 'unparseSettings' ? _ScriptData[K] : Immutable<_ScriptData[K]>;
};

interface RevisionsResponse {
	query: {
		pages: {
			revisions?: {
				revid: string;
				slots: {
					main: {
						content: string;
					};
				};
			}[];
		}[];
	};
}

async function getPageInfo(api: mw.Api): Promise<PageInfo> {
	const name = mw.config.get('wgPageName');
	const params = {
		action: 'query',
		titles: [name],
		prop: 'revisions',
		rvprop: ['ids', 'content'],
		rvslots: 'main',
		rvlimit: 1,
		format: 'json',
		formatversion: 2
	};
	const response = (await api.get(params)) as RevisionsResponse;

	const revision = response.query.pages[0]?.revisions?.[0];
	const revisionID = revision?.revid;
	const content = revision?.slots.main.content ?? '';

	return { name, revisionID, content };
}

interface UserGroupInfo {
	name: string;
	rights: string[];
	number?: number;
}

interface SiteInfoResponse {
	query: {
		namespaces: Record<NamespaceID, NamespaceData>;
		skins: SkinInfo[];
		usergroups: UserGroupInfo[];
	};
}

type SiteInfoData = [ScriptData['namespaces'], ScriptData['skins'], ScriptData['localPermissions']];

function getLocalPermissionsMap(usergroups: SiteInfoResponse['query']['usergroups']): _ScriptData['localPermissions'] {
	const unsorted: Record<string, PermissionInfo> = {};

	for (const group of usergroups) {
		for (const permission of group.rights) {
			unsorted[permission] ??= {
				groups: [],
				users: 0
			};
			unsorted[permission].groups.push(group.name);
			unsorted[permission].users += group.number ?? Infinity;
		}
	}

	const sorted: _ScriptData['localPermissions'] = new Map();

	for (const permission of Object.keys(unsorted).sort()) {
		sorted.set(permission, {
			groups: unsorted[permission].groups.sort(),
			users: unsorted[permission].users
		});
	}

	return sorted;
}

async function getSiteInfo(api: mw.Api): Promise<SiteInfoData> {
	const params = {
		action: 'query',
		meta: ['siteinfo'],
		siprop: ['namespaces', 'skins', 'usergroups'],
		sinumberingroup: true,
		format: 'json',
		formatversion: 2
	};
	const response = (await api.get(params)) as SiteInfoResponse;

	const { query } = response;

	const permissions = getLocalPermissionsMap(query.usergroups);
	const skins = new Map(query.skins.map(info => [info.code, info]));
	const namespaces = new Map(
		Object.entries(query.namespaces).sort(([firstID], [secondID]) => Number(firstID) - Number(secondID))
	);

	return [namespaces, skins, permissions];
}

interface HelpResponse {
	help: {
		help: string;
	};
}

async function getPossibleValuesFromHelp(
	api: mw.Api,
	module: string,
	extractPossibleValues: (_: Document) => string[] | undefined
): Promise<string[]> {
	const params = {
		action: 'help',
		modules: [module],
		wrap: true,
		uselang: 'en',
		format: 'json',
		formatversion: 2
	};
	const response = (await api.get(params)) as HelpResponse;

	const html = response.help.help;
	const document = new DOMParser().parseFromString(html, 'text/html');

	const possibleValues = extractPossibleValues(document);

	if (!possibleValues) {
		console.error({ document, possibleValues });
		throw new Error(`Could not query possible values for module ${module}`);
	}

	return possibleValues;
}

async function getAllPermissions(api: mw.Api): Promise<ScriptData['allPermissions']> {
	const EXPECTED_PREFIX = 'Values (separate with | or alternative):';

	return getPossibleValuesFromHelp(api, 'query+allusers', document => {
		const dt = document.querySelector('dt:has(> [id="query+allusers:aurights"])');
		const description = dt?.nextElementSibling;
		const possibleValuesInfo = description?.nextElementSibling;

		if (description?.matches('dd.description') !== true || possibleValuesInfo?.matches('dd.info') !== true) {
			return undefined;
		}

		const text = possibleValuesInfo.textContent.trim();

		if (!text.startsWith(EXPECTED_PREFIX)) {
			return undefined;
		}

		return text
			.slice(EXPECTED_PREFIX.length)
			.split(/\s*,\s*/)
			.sort();
	});
}

async function getContentModels(api: mw.Api): Promise<ScriptData['contentModels']> {
	const EXPECTED_PREFIX = 'One of the following values:';

	return getPossibleValuesFromHelp(api, 'changecontentmodel', document => {
		const dt = document.querySelector('dt:has(> [id="changecontentmodel:model"])');
		const description = dt?.nextElementSibling;
		const requiredInfo = description?.nextElementSibling;
		const possibleValuesInfo = requiredInfo?.nextElementSibling;

		if (
			description?.matches('dd.description') !== true ||
			requiredInfo?.matches('dd.info') !== true ||
			possibleValuesInfo?.matches('dd.info') !== true
		) {
			return undefined;
		}

		const text = possibleValuesInfo.textContent.trim();

		if (!text.startsWith(EXPECTED_PREFIX)) {
			return undefined;
		}

		return text
			.slice(EXPECTED_PREFIX.length)
			.split(/\s*,\s*/)
			.sort((first, second) => first.toLowerCase().localeCompare(second.toLowerCase()));
	});
}

interface ParseResponse {
	parse: {
		text: string;
	};
}

async function getLanguageInfo(api: mw.Api): Promise<ScriptData['languageInfo']> {
	const language = '{{CONTENTLANGUAGE}}';
	const params = {
		action: 'parse',
		prop: 'text',
		text: `${language}\n{{#language:${language}}}\n{{#language:${language}|en}}\n{{#dir:${language}}}`,
		contentmodel: 'wikitext',
		disablelimitreport: true,
		format: 'json',
		formatversion: 2
	};
	const response = (await api.get(params)) as ParseResponse;

	const html = response.parse.text;
	const document = new DOMParser().parseFromString(html, 'text/html');
	const rendered = document.querySelector('p')?.textContent;

	if (rendered === undefined) {
		console.error({ params, response });
		throw new Error('Failed to retrieve language info');
	}

	const [code, nameInSelf, nameInEnglish, direction] = rendered.split('\n');

	return {
		code,
		nameInSelf,
		nameInEnglish,
		direction: direction as LanguageInfo['direction']
	};
}

async function getUnparseSettings(api: mw.Api): Promise<ScriptData['unparseSettings']> {
	const params = {
		action: 'query',
		titles: [constants.UNPARSE_SETTINGS_PAGE],
		prop: 'revisions',
		rvprop: ['ids', 'content'],
		rvslots: 'main',
		rvlimit: 1,
		format: 'json',
		formatversion: 2
	};
	const response = (await api.get(params)) as RevisionsResponse;

	const revision = response.query.pages[0]?.revisions?.[0];
	const content = revision?.slots.main.content ?? '';

	try {
		const overrideSettings = JSON.parse(content) as UnparseSettings;
		return Object.assign(structuredClone(defaultUnparseSettings), overrideSettings);
	} catch {
		return defaultUnparseSettings;
	}
}

export async function getData(api: mw.Api): Promise<ScriptData> {
	const [
		pageInfo,
		[namespaces, skins, localPermissions],
		allPermissions,
		contentModels,
		languageInfo,
		unparseSettings
	] = await Promise.all([
		getPageInfo(api),
		getSiteInfo(api),
		getAllPermissions(api),
		getContentModels(api),
		getLanguageInfo(api),
		getUnparseSettings(api)
	]);

	return {
		pageInfo,
		contentModels,
		namespaces,
		localPermissions,
		allPermissions,
		skins,
		languageInfo,
		unparseSettings
	};
}
