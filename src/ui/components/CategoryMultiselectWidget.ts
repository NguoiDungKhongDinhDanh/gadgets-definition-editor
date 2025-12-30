import { lookUpCategories } from '../../lookups';
import { LookupElement, MenuOptionWidget, TagItemWidget, TextInputWidget } from '../ooui';
import { Category } from '../resources';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import type { Abortable } from './component';
import component from './component';

interface InputProps {
	api: mw.Api;
}

type CategoryInputWidget = InstanceType<typeof CategoryInputWidget>;

const CategoryInputWidget = component(TextInputWidget, [LookupElement], {
	constructor(config: OO.ui.TextInputWidget.ConfigOptions, { api }: InputProps) {
		this.api = api;

		CategoryInputWidget.super.call(this, {
			autocomplete: false,
			...config
		});
		LookupElement.call(this, {});
	},
	/**
	 * @override
	 */
	getLookupRequest(): JQuery.Promise<Category[]> & Abortable {
		const deferred = $.Deferred<Category[]>();
		const prefix = this.getValue();

		void lookUpCategories(this.api, prefix).then(pages => {
			deferred.resolve(pages.filter(page => !page.title.includes(',')));
		});

		return deferred.promise({
			abort() {}
		});
	},
	/**
	 * @override
	 */
	getLookupCacheDataFromResponse(pages: Category[] | undefined): Category[] {
		return pages ?? [];
	},
	/**
	 * @override
	 */
	getLookupMenuOptionsFromData(pages: Category[]): MenuOptionWidget[] {
		return pages.map(page => new MenuOptionWidget({ label: page.createLink(), data: page }));
	}
});

interface Props {
	api: mw.Api;
}

type CategoryMultiselectWidget = InstanceType<typeof CategoryMultiselectWidget>;

const CategoryMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor({ input, ...config }: OO.ui.MenuTagMultiselectWidget.ConfigOptions, { api }: Props) {
		this.api = api;

		const inputWidget = new CategoryInputWidget(input ?? {}, { api });

		CategoryMultiselectWidget.super.call(this, {
			allowArbitrary: true,
			inputPosition: 'outline',
			inputWidget,
			...config
		});
	},
	/**
	 * @override
	 */
	addTagFromInput() {
		const { label: titles } = CategoryMultiselectWidget.super.prototype.getTagInfoFromInput.call(this);

		for (const title of titles.trim().split(/\s*,\s*/)) {
			if (title) {
				this.addTag(title, title);
			}
		}

		this.clearInput();
	},
	/**
	 * @override
	 */
	createTagItemWidget(data: unknown, _label: unknown): OO.ui.TagItemWidget {
		if (typeof data === 'string') {
			return this.createTagItemFromName(data);
		}

		if (data instanceof Category) {
			return this.createTagItemFromPage(data);
		}

		console.warn(data);
		throw new Error(`Unexpected tag data: ${data}`);
	},
	/**
	 * @access private
	 */
	createTagItemFromName(name: string): TagItemWidget {
		const page = Category.fromTitle(name);

		if (page) {
			return this.createTagItemFromPage(page);
		}

		return new TagItemWidget({ label: name, data: name });
	},
	/**
	 * @access private
	 */
	createTagItemFromPage(page: Category): TagItemWidget {
		return new TagItemWidget({ label: page.createLink(), data: page });
	}
});

export default CategoryMultiselectWidget;
