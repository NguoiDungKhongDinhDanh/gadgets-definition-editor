import ComponentWrapper from '../../ComponentWrapper';
import { ButtonOptionWidget, ButtonSelectWidget } from '../../ooui';

export enum EditorMode {
	WIKITEXT = 'wikitext',
	HEADING = 'heading',
	DEFINITION = 'definition'
}

export default class Switcher extends ComponentWrapper<ButtonSelectWidget> {
	readonly wikitext = new ButtonOptionWidget({
		label: 'Wikitext',
		title: 'Switch to wikitext editor',
		data: EditorMode.WIKITEXT
	});
	readonly heading = new ButtonOptionWidget({
		label: 'Heading',
		title: 'Switch to heading editor',
		data: EditorMode.HEADING
	});
	readonly definition = new ButtonOptionWidget({
		label: 'Definition',
		title: 'Switch to definition editor',
		data: EditorMode.DEFINITION
	});

	override readonly component: ButtonSelectWidget = new ButtonSelectWidget({
		items: [this.wikitext, this.heading, this.definition]
	});

	switchTo(mode: EditorMode): void {
		this.component.selectItemByData(mode);
	}
}
