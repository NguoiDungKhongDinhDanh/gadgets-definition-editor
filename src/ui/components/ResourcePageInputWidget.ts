import constants from '../../constants';
import { lookUpResourcePages } from '../../lookups';
import { LookupElement, MenuOptionWidget, TextInputWidget } from '../ooui';
import type { ResourcePage } from '../resources';
import { ResourcePageType } from '../resources';
import type { Abortable } from './component';
import component from './component';

interface Props {
	api: mw.Api;
	kind: ResourcePageType;
}

type ResourcePageInputWidget = InstanceType<typeof ResourcePageInputWidget>;

const ResourcePageInputWidget = component(TextInputWidget, [LookupElement], {
	constructor(config: OO.ui.TextInputWidget.ConfigOptions, { api, kind }: Props) {
		this.api = api;
		this.kind = kind;

		ResourcePageInputWidget.super.call(this, {
			autocomplete: false,
			...config
		});
		LookupElement.call(this, {});
	},
	/**
	 * @override
	 */
	getLookupRequest(): JQuery.Promise<ResourcePage[]> & Abortable {
		const deferred = $.Deferred<ResourcePage[]>();

		const shortName = this.getValue();
		let searchPrefix: string;

		switch (this.kind) {
			case ResourcePageType.NAME:
			case ResourcePageType.SOURCE:
				searchPrefix = shortName;
				break;
			case ResourcePageType.SECTION:
				searchPrefix = `${constants.PREFIXES.RESOURCE_SECTION_PAGE_ONLY}${shortName}`;
				break;
		}

		void lookUpResourcePages(this.api, searchPrefix).then(pages => {
			if (this.kind === ResourcePageType.SOURCE) {
				pages = pages.filter(page => page.suffix !== undefined);
			}

			deferred.resolve(pages);
		});

		return deferred.promise({
			abort() {}
		});
	},
	/**
	 * @override
	 */
	getLookupCacheDataFromResponse(pages: ResourcePage[] | undefined): ResourcePage[] {
		return pages ?? [];
	},
	/**
	 * @override
	 */
	getLookupMenuOptionsFromData(pages: ResourcePage[]): MenuOptionWidget[] {
		return pages.map(page => new MenuOptionWidget({ label: page.createLink(), data: page }));
	}
});

export default ResourcePageInputWidget;
