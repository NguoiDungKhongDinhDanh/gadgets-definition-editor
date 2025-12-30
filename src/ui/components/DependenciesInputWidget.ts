import type { NoProps } from './component';
import component from './component';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';

type DependenciesInputWidget = InstanceType<typeof DependenciesInputWidget>;

const DependenciesInputWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor(config: OO.ui.MenuTagMultiselectWidget.ConfigOptions = {}, _props?: NoProps) {
		const modules = [...mw.loader.getModuleNames()].sort();
		const options = modules.map(module => ({ label: module, data: module }));

		DependenciesInputWidget.super.call(this, {
			allowArbitrary: true,
			options,
			...config
		});
	}
});

export default DependenciesInputWidget;
