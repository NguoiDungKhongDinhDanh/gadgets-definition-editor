import ComponentWrapper from '../../ComponentWrapper';
import { ButtonGroupWidget, ButtonWidget } from '../../ooui';

export default class Movers extends ComponentWrapper<ButtonGroupWidget> {
	readonly moveUp = new ButtonWidget({
		label: '',
		title: 'Move editor up one place',
		icon: 'arrowUp'
	});
	readonly moveDown = new ButtonWidget({
		label: '',
		title: `Move editor down one place`,
		icon: 'arrowDown'
	});

	override readonly component = new ButtonGroupWidget({
		items: [this.moveUp, this.moveDown]
	});
}
