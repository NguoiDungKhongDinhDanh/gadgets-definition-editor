import type { ScriptData } from '../../data';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import component from './component';
import { menuOptionLabel } from './menuOptions';

interface Props {
	skins: ScriptData['skins'];
}

type SkinMultiselectWidget = InstanceType<typeof SkinMultiselectWidget>;

const SkinMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor({ skins }: Props) {
		this.skins = skins;

		const options = [...skins.values()].map(skin => {
			const info = skin.default === true ? 'default' : skin.unusable === true ? 'unusable' : undefined;

			return {
				label: menuOptionLabel(skin.name, info),
				data: skin.code
			};
		});

		SkinMultiselectWidget.super.call(this, {
			allowArbitrary: false,
			options
		});
	},
	/**
	 * @override
	 */
	getTagInfo(data: unknown, _label?: string | JQuery): OO.ui.TagMultiselectWidget.TagInfo | undefined {
		const skinCode = data as string;
		const skinInfo = this.skins.get(skinCode);

		if (!skinInfo) {
			return undefined;
		}

		return { data: skinCode, label: skinInfo.name };
	}
});

export default SkinMultiselectWidget;
