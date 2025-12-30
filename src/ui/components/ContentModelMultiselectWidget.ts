import type { ScriptData } from '../../data';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import type { NoProps } from './component';
import component from './component';

type ContentModelMultiselectWidget = InstanceType<typeof ContentModelMultiselectWidget>;

const ContentModelMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor(contentModels: ScriptData['contentModels'], _props?: NoProps) {
		const options = contentModels.map(model => ({
			label: model,
			data: model
		}));

		ContentModelMultiselectWidget.super.call(this, {
			allowArbitrary: false,
			options,
			input: { autocomplete: false },
			menu: { filterMode: 'substring' }
		});
	}
});

export default ContentModelMultiselectWidget;
