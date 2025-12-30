import type { NoProps } from './component';
import component from './component';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import type { ResolvedOptions } from '../../options';

/**
 * @see {@linkcode ResolvedOptions}
 */
const KNOWN_SETTINGS: readonly (keyof ResolvedOptions)[] = [
	'ResourceLoader',
	'default',
	'hidden',
	'package',
	'requiresES6',
	'supportsUrlLoad',
	'type',
	'actions',
	'categories',
	'codexIcons',
	'contentModels',
	'dependencies',
	'namespaces',
	'peers',
	'rights',
	'skins'
];

type UnparseSettingsMultiselectWidget = InstanceType<typeof UnparseSettingsMultiselectWidget>;

const UnparseSettingsMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor(config: OO.ui.MenuTagMultiselectWidget.ConfigOptions = {}, _props?: NoProps) {
		const options = KNOWN_SETTINGS.map(name => ({ label: name, data: name }));

		UnparseSettingsMultiselectWidget.super.call(this, {
			options,
			...config
		});
	}
});

export default UnparseSettingsMultiselectWidget;
