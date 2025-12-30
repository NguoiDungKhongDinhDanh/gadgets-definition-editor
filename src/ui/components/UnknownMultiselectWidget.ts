import type { TextInputWidget } from '../ooui';
import { TagMultiselectWidget } from '../ooui';
import component from './component';

interface Props {
	input?: TextInputWidget;
}

type UnknownMultiselectWidget = InstanceType<typeof UnknownMultiselectWidget>;

const UnknownMultiselectWidget = component(TagMultiselectWidget, [], {
	constructor({ input, ...config }: OO.ui.TagMultiselectWidget.ConfigOptions = {}, _props?: Props) {
		UnknownMultiselectWidget.super.call(this, {
			allowArbitrary: true,
			input: {
				autocomplete: false,
				...input
			},
			...config
		});

		this.input?.setDisabled(true);
	}
});

export default UnknownMultiselectWidget;
