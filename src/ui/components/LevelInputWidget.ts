import { NumberInputWidget } from '../ooui';
import type { NoProps } from './component';
import component from './component';

type LevelInputWidget = InstanceType<typeof LevelInputWidget>;

/**
 * Same as {@linkcode NumberInputWidget},
 * but assignable to {@linkcode OO.ui.Widget} at compile time.
 */
const LevelInputWidget = component(NumberInputWidget, [], {
	constructor(config: OO.ui.NumberInputWidget.ConfigOptions, _props?: NoProps) {
		LevelInputWidget.super.call(this, config);
	}
});

export default LevelInputWidget;
