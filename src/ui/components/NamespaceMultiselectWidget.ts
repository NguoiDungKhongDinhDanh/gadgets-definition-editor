import type { ScriptData } from '../../data';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import component from './component';

interface Props {
	namespaces: ScriptData['namespaces'];
}

type NamespaceMultiselectWidget = InstanceType<typeof NamespaceMultiselectWidget>;

const NamespaceMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor({ namespaces }: Props) {
		this.namespaces = namespaces;

		const options = [...namespaces.values()].map(namespace => ({
			label: namespace.id === 0 ? '(Main)' : (namespace.canonical ?? namespace.name),
			data: namespace.id.toString()
		}));

		NamespaceMultiselectWidget.super.call(this, {
			allowReordering: false,
			options
		});
	}
});

export default NamespaceMultiselectWidget;
