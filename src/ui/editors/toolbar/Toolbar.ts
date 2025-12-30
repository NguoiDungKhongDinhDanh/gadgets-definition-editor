import constants from '../../../constants';
import ComponentWrapper from '../../ComponentWrapper';
import { ButtonWidget, FieldLayout, FieldsetLayout, HorizontalLayout, Widget } from '../../ooui';
import { Adders } from './Adders';
import Movers from './Movers';
import Switcher from './Switcher';

export default class Toolbar extends ComponentWrapper<FieldsetLayout> {
	readonly switcher = new Switcher();
	readonly movers = new Movers();
	readonly remover = new ButtonWidget({
		icon: 'trash',
		title: 'Remove this editor',
		flags: ['destructive']
	});
	readonly adders = new Adders();

	override readonly component = new FieldsetLayout({
		classes: [constants.IDENTIFIERS.ROW_TOOLBAR],
		label: 'Tools',
		items: [
			new FieldLayout(
				new Widget({
					content: [
						new HorizontalLayout({
							items: [this.switcher.component]
						})
					]
				})
			),
			new FieldLayout(
				new Widget({
					content: [
						new HorizontalLayout({
							items: [this.adders.component, this.movers.component, this.remover]
						})
					]
				})
			)
		]
	});
}
