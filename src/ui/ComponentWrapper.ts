import type { Element } from './ooui';

export default abstract class ComponentWrapper<C extends Element> {
	abstract readonly component: C;

	get $element(): C['$element'] {
		return this.component.$element;
	}
}
