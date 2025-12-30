import { Option } from '../../AST';
import { GadgetType } from '../../Gadget';
import constants from '../../constants';
import type { ScriptData } from '../../data';
import type { ResolvedOptions, UnknownOptions } from '../../options';
import { parseOptions } from '../../parse';
import { unparseOption } from '../../unparse';
import ComponentWrapper from '../ComponentWrapper';
import ActionMultiselectWidget from '../components/ActionMultiselectWidget';
import CancellableProcessDialog from '../components/CancellableProcessDialog';
import CategoryMultiselectWidget from '../components/CategoryMultiselectWidget';
import CodexIconMultiselectWidget from '../components/CodexIconMultiselectWidget';
import ContentModelMultiselectWidget from '../components/ContentModelMultiselectWidget';
import DependenciesInputWidget from '../components/DependenciesInputWidget';
import NamespaceMultiselectWidget from '../components/NamespaceMultiselectWidget';
import PeersMultiselectWidget from '../components/PeersMultiselectWidget';
import RightMultiselectWidget from '../components/RightMultiselectWidget';
import SkinMultiselectWidget from '../components/SkinMultiselectWidget';
import UnknownMultiselectWidget from '../components/UnknownMultiselectWidget';
import component from '../components/component';
import type { Element, OptionWidget } from '../ooui';
import {
	ButtonOptionWidget,
	ButtonSelectWidget,
	CheckboxInputWidget,
	FieldLayout,
	FieldsetLayout,
	HorizontalLayout,
	Widget
} from '../ooui';

type OptionsDialog = InstanceType<typeof OptionsDialog>;

const OptionsDialog = component(CancellableProcessDialog, [], {
	static: {
		title: 'Modify definition options'
	},
	constructor(config: OO.ui.ProcessDialog.ConfigOptions, props: { content: Element[] }) {
		OptionsDialog.super.call(this, { size: 'larger', ...config }, props);
	}
});

export class OptionsPanel extends ComponentWrapper<OptionsDialog> {
	override readonly component: OptionsDialog;

	private readonly data: ScriptData;

	private readonly resourceLoaderInput: CheckboxInputWidget;
	private readonly hiddenInput: CheckboxInputWidget;
	private readonly defaultInput: CheckboxInputWidget;
	private readonly packageInput: CheckboxInputWidget;
	private readonly requiresES6Input: CheckboxInputWidget;
	private readonly supportsUrlLoadInput: CheckboxInputWidget;

	private readonly typeInput: ButtonSelectWidget;

	private readonly actionsInput: ActionMultiselectWidget;
	private readonly categoriesInput: CategoryMultiselectWidget;
	private readonly codexIconsInput: CodexIconMultiselectWidget;
	private readonly contentModelsInput: ContentModelMultiselectWidget;
	private readonly dependenciesInput: DependenciesInputWidget;
	private readonly namespacesInput: NamespaceMultiselectWidget;
	private readonly peersInput: PeersMultiselectWidget;
	private readonly rightsInput: RightMultiselectWidget;
	private readonly skinsInput: SkinMultiselectWidget;

	private readonly unknownInput: UnknownMultiselectWidget;

	constructor(data: ScriptData, api: mw.Api) {
		super();

		this.data = data;

		this.defaultInput = new CheckboxInputWidget();
		this.hiddenInput = new CheckboxInputWidget();
		this.packageInput = new CheckboxInputWidget();
		this.requiresES6Input = new CheckboxInputWidget();
		this.resourceLoaderInput = new CheckboxInputWidget();
		this.supportsUrlLoadInput = new CheckboxInputWidget({ selected: true });

		this.typeInput = new ButtonSelectWidget({
			items: [
				new ButtonOptionWidget({ label: 'Not specified', data: undefined, selected: true }),
				new ButtonOptionWidget({ label: 'General', data: GadgetType.GENERAL }),
				new ButtonOptionWidget({ label: 'Styles', data: GadgetType.STYLES })
			]
		});

		this.actionsInput = new ActionMultiselectWidget();
		this.categoriesInput = new CategoryMultiselectWidget({}, { api });
		this.codexIconsInput = new CodexIconMultiselectWidget();
		this.contentModelsInput = new ContentModelMultiselectWidget(data.contentModels);
		this.dependenciesInput = new DependenciesInputWidget();
		this.namespacesInput = new NamespaceMultiselectWidget(data);
		this.peersInput = new PeersMultiselectWidget();
		this.rightsInput = new RightMultiselectWidget(data);
		this.skinsInput = new SkinMultiselectWidget(data);

		this.unknownInput = new UnknownMultiselectWidget();

		const checkboxes = new HorizontalLayout({
			classes: [constants.IDENTIFIERS.OPTIONS_CHECKBOXES],
			items: [
				new FieldLayout(this.resourceLoaderInput, { label: 'ResourceLoader', align: 'inline' }),
				new FieldLayout(this.defaultInput, { label: 'Default', align: 'inline' }),
				new FieldLayout(this.hiddenInput, { label: 'Hidden', align: 'inline' }),
				new FieldLayout(this.packageInput, { label: 'Package', align: 'inline' }),
				new FieldLayout(this.requiresES6Input, { label: 'Requires ES6', align: 'inline' }),
				new FieldLayout(this.supportsUrlLoadInput, { label: 'Supports URL load', align: 'inline' })
			]
		});
		const fieldset = new FieldsetLayout({
			items: [
				new FieldLayout(new Widget(checkboxes)),

				new FieldLayout(this.typeInput, { label: 'Type:' }),

				new FieldLayout(this.actionsInput, { label: 'Actions:' }),
				new FieldLayout(this.categoriesInput, { label: 'Categories:' }),
				new FieldLayout(this.codexIconsInput, { label: 'Codex icons:' }),
				new FieldLayout(this.contentModelsInput, { label: 'Content models:' }),
				new FieldLayout(this.dependenciesInput, { label: 'Dependencies:' }),
				new FieldLayout(this.namespacesInput, { label: 'Namespaces:' }),
				new FieldLayout(this.peersInput, { label: 'Peers:' }),
				new FieldLayout(this.rightsInput, { label: 'Rights:' }),
				new FieldLayout(this.skinsInput, { label: 'Skins:' }),

				new FieldLayout(this.unknownInput, { label: 'Unknown options:' })
			]
		});

		this.component = new OptionsDialog({}, { content: [fieldset] });
	}

	get value(): Option[] {
		function emit(name: keyof ResolvedOptions, value: string | undefined, condition: boolean): Option | undefined;

		function emit(name: keyof ResolvedOptions, value: string[]): Option | undefined;

		function emit(name: keyof ResolvedOptions, value: unknown, condition?: boolean): Option | undefined {
			if (value instanceof Array) {
				condition ??= value.length !== 0;
			}

			if (condition === false) {
				return undefined;
			}

			return new Option(name, value?.toString());
		}

		const type = (this.typeInput.findSelectedItem() as OptionWidget).getData() as GadgetType | undefined;
		const unknown = this.unknownInput.getValue().join('|');

		return [
			emit('ResourceLoader', undefined, this.resourceLoaderInput.isSelected()),
			emit('default', undefined, this.defaultInput.isSelected()),
			emit('hidden', undefined, this.hiddenInput.isSelected()),
			emit('package', undefined, this.packageInput.isSelected()),
			emit('requiresES6', undefined, this.requiresES6Input.isSelected()),
			emit('supportsUrlLoad', 'false', !this.supportsUrlLoadInput.isSelected()),

			emit('type', type, type !== undefined),

			emit('actions', this.actionsInput.value),
			emit('categories', this.categoriesInput.value),
			emit('codexIcons', this.codexIconsInput.value),
			emit('contentModels', this.contentModelsInput.value),
			emit('dependencies', this.dependenciesInput.value),
			emit('namespaces', this.namespacesInput.value),
			emit('peers', this.peersInput.value),
			emit('rights', this.rightsInput.value),
			emit('skins', this.skinsInput.value),

			...parseOptions(unknown)
		].filter(option => option !== undefined);
	}

	get cancelled(): boolean {
		return this.component.cancelled === true;
	}

	reset(resolved: ResolvedOptions, unknown: UnknownOptions): void {
		this.hiddenInput.setSelected(resolved.hidden === true);
		this.defaultInput.setSelected(resolved.default === true);
		this.packageInput.setSelected(resolved.package === true);
		this.requiresES6Input.setSelected(resolved.requiresES6 === true);
		this.resourceLoaderInput.setSelected(resolved.ResourceLoader === true);
		this.supportsUrlLoadInput.setSelected(resolved.supportsUrlLoad !== false);

		if (Object.values(GadgetType).includes(resolved.type as GadgetType)) {
			this.typeInput.selectItemByData(resolved.type);
		} else {
			this.typeInput.selectItemByData(undefined);
		}

		this.actionsInput.addTags(resolved.actions ?? []);
		this.categoriesInput.addTags(resolved.categories ?? []);
		this.codexIconsInput.addTags(resolved.codexIcons ?? []);
		this.contentModelsInput.addTags(resolved.contentModels ?? []);
		this.dependenciesInput.addTags(resolved.dependencies ?? []);
		this.namespacesInput.addTags(resolved.namespaces ?? []);
		this.peersInput.addTags(resolved.peers ?? []);
		this.rightsInput.addTags(resolved.rights ?? []);
		this.skinsInput.addTags(resolved.skins ?? []);

		unknown.forEach(option => {
			const label = unparseOption(option, this.data.unparseSettings);
			this.unknownInput.addTag(label, label);
		});
	}
}
