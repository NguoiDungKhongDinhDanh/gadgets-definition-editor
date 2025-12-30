import constants from './constants';
import { Category, ResourcePage } from './ui/resources';

enum NamespaceID {
	MEDIAWIKI = 8,
	CATEGORY = 14
}

interface AllPagesResponse {
	query: {
		allpages: {
			pageid: number;
			title: string;
		}[];
	};
}

async function lookUp(api: mw.Api, namespaceID: number, prefix: string): Promise<string[]> {
	const params = {
		action: 'query',
		list: 'allpages',
		apprefix: prefix,
		apnamespace: namespaceID,
		aplimit: 10,
		format: 'json',
		formatversion: 2
	};

	try {
		const response = (await api.get(params)) as AllPagesResponse;
		return response.query.allpages.map(page => page.title);
	} catch (error) {
		console.error(error);
		return [];
	}
}

export async function lookUpResourcePages(api: mw.Api, prefix: string): Promise<ResourcePage[]> {
	const fullPrefix = `${constants.PREFIXES.RESOURCE_PAGE}${prefix}`;
	const namespaceID = NamespaceID.MEDIAWIKI;
	const names = await lookUp(api, namespaceID, fullPrefix);

	return names.map(name => ResourcePage.create(name)).filter(page => page !== undefined);
}

export async function lookUpCategories(api: mw.Api, prefix: string): Promise<Category[]> {
	const namespaceID = NamespaceID.CATEGORY;
	const names = await lookUp(api, namespaceID, prefix);

	return names.map(name => Category.create(name)).filter(page => page !== undefined);
}
