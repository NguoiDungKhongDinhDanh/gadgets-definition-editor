import { TagItemWidget } from '../ooui';
import { ResourcePage, ResourcePageType } from '../resources';
import ResourcePageInputWidget from './ResourcePageInputWidget';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import component from './component';

interface Props {
	api: mw.Api;
}

type SourcePageMultiselectWidget = InstanceType<typeof SourcePageMultiselectWidget>;

const SourcePageMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor({ input, ...config }: OO.ui.TagMultiselectWidget.ConfigOptions, { api }: Props) {
		this.api = api;

		const inputWidget = new ResourcePageInputWidget(input ?? {}, { api, kind: ResourcePageType.SOURCE });

		SourcePageMultiselectWidget.super.call(this, {
			allowArbitrary: true,
			inputPosition: 'outline',
			inputWidget,
			...config
		});
	},
	/**
	 * @override
	 */
	createTagItemWidget(data: unknown, _label: unknown): OO.ui.TagItemWidget {
		if (typeof data === 'string') {
			return this.createTagItemFromName(data);
		}

		if (data instanceof ResourcePage) {
			return this.createTagItemFromPage(data);
		}

		console.warn(data);
		throw new Error(`Unexpected tag data: ${data}`);
	},
	/**
	 * @access private
	 */
	createTagItemFromName(name: string): TagItemWidget {
		const page = ResourcePage.fromShortName(name);

		if (page) {
			return this.createTagItemFromPage(page);
		}

		return new TagItemWidget({ label: name, data: name });
	},
	/**
	 * @access private
	 */
	createTagItemFromPage(page: ResourcePage): TagItemWidget {
		return new TagItemWidget({ label: page.createLink(), data: page });
	}
});

export default SourcePageMultiselectWidget;
