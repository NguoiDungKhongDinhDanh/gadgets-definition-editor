import constants from '../../constants';
import type { MenuOptionWidget, TagItemWidget } from '../ooui';
import type { NoProps } from './component';
import component from './component';

type Option = OO.ui.MenuTagMultiselectWidget.Option & { data: string };
type Config = OO.ui.MenuTagMultiselectWidget.ConfigOptions & { options?: Option[] };

type StringMenuTagMultiselectWidget = InstanceType<typeof StringMenuTagMultiselectWidget>;

const StringMenuTagMultiselectWidget = component(OO.ui.MenuTagMultiselectWidget, [], {
	constructor({ input, menu, ...config }: Config, _props?: NoProps) {
		OO.ui.MenuTagMultiselectWidget.call(this, {
			classes: [constants.IDENTIFIERS.MAX_WIDTH],
			input: {
				autocomplete: false,
				...input
			},
			menu: {
				filterMode: 'substring',
				...menu
			},
			...config
		});
	},
	/**
	 * @access public
	 */
	get value(): string[] {
		const items = this.getItems() as unknown as { data: string }[];

		return items.map(item => item.data);
	},
	/**
	 * @override
	 */
	addTag(data: unknown, label: string | JQuery): boolean {
		const addTag = StringMenuTagMultiselectWidget.super.prototype.addTag.bind(this);
		const item = this.getMenu().findItemFromData(data) as MenuOptionWidget | null;

		if (!item) {
			return addTag(data, label);
		}

		this.getMenu().selectItem(item);

		return addTag(item.getData(), item.getLabel() ?? label);
	},
	/**
	 * @override
	 * @access protected
	 */
	createTagItemWidget(data: unknown, label?: string | JQuery): TagItemWidget {
		const _SuperPrototype = StringMenuTagMultiselectWidget.super.prototype;
		const SuperPrototype = _SuperPrototype as typeof _SuperPrototype & {
			createTagItemWidget: StringMenuTagMultiselectWidget['createTagItemWidget'];
		};

		const processedInfo = this.getTagInfo(data, label);

		return SuperPrototype.createTagItemWidget.call(
			this,
			processedInfo?.data ?? data,
			processedInfo?.label ?? label
		);
	},
	/**
	 * @access protected
	 */
	getTagInfo(data: unknown, label?: string | JQuery): OO.ui.TagMultiselectWidget.TagInfo | undefined {
		if (typeof data !== 'string' || typeof label !== 'string') {
			return undefined;
		}

		return { data, label };
	},
	/**
	 * @access public
	 */
	addTags(tags: readonly string[]): void {
		tags.forEach(tag => this.addTag(tag, tag));
	}
});

export default StringMenuTagMultiselectWidget;
