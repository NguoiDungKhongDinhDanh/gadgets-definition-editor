import type { NoProps } from './component';
import component from './component';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';

type PeersMultiselectWidget = InstanceType<typeof PeersMultiselectWidget>;

const PeersMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor(config: OO.ui.MenuTagMultiselectWidget.ConfigOptions = {}, _props?: NoProps) {
		PeersMultiselectWidget.super.call(this, {
			allowArbitrary: true,
			...config
		});

		// TODO: Autocomplete
	}
});

export default PeersMultiselectWidget;
