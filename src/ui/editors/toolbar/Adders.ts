import ComponentWrapper from '../../ComponentWrapper';
import { ButtonGroupWidget, ButtonWidget } from '../../ooui';
import { EditorMode } from './Switcher';

export interface AdderData {
	mode: EditorMode;
}

export class Adders extends ComponentWrapper<ButtonGroupWidget> {
	readonly wikitext: ButtonWidget = new ButtonWidget({
		icon: 'add',
		label: `W`,
		title: `Add new wikitext editor below`,
		data: { mode: EditorMode.WIKITEXT } satisfies AdderData
	});
	readonly heading: ButtonWidget = new ButtonWidget({
		label: 'H',
		title: `Add new heading editor below`,
		data: { mode: EditorMode.HEADING } satisfies AdderData
	});
	readonly definition: ButtonWidget = new ButtonWidget({
		label: 'D',
		title: `Add new definition editor below`,
		data: { mode: EditorMode.DEFINITION } satisfies AdderData
	});

	override readonly component: ButtonGroupWidget = new ButtonGroupWidget({
		items: [this.wikitext, this.heading, this.definition]
	});

	get items(): readonly ButtonWidget[] {
		return [this.wikitext, this.heading, this.definition];
	}
}
