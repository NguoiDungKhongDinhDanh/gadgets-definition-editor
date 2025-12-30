import constants from '../../constants';
import type { UnparseSettings } from '../../unparse';
import CancellableProcessDialog from '../components/CancellableProcessDialog';
import component from '../components/component';
import UnparseSettingsMultiselectWidget from '../components/UnparseSettingsMultiselectWidget';
import ComponentWrapper from '../ComponentWrapper';
import type { Element } from '../ooui';
import { CheckboxInputWidget, FieldLayout, FieldsetLayout, HorizontalLayout, LabelWidget, Widget } from '../ooui';

type UnparseSettingsDialog = InstanceType<typeof UnparseSettingsDialog>;

const UnparseSettingsDialog = component(CancellableProcessDialog, [], {
	static: {
		title: 'Format settings'
	},
	constructor(config: OO.ui.ProcessDialog.ConfigOptions, props: { content: Element[] }) {
		UnparseSettingsDialog.super.call(this, { size: 'larger', ...config }, props);
	},
	/**
	 * @override
	 */
	getBodyHeight() {
		return 500;
	}
});

export class UnparseSettingsPanel extends ComponentWrapper<UnparseSettingsDialog> {
	override readonly component: UnparseSettingsDialog;

	private readonly headingPaddingsInput: CheckboxInputWidget;
	private readonly namePaddingInput: CheckboxInputWidget;
	private readonly optionsPaddingBeforeOpeningInput: CheckboxInputWidget;
	private readonly optionsPaddingAfterOpeningInput: CheckboxInputWidget;
	private readonly optionsPaddingBeforeClosingInput: CheckboxInputWidget;
	private readonly optionsPaddingBeforePipeInput: CheckboxInputWidget;
	private readonly optionsPaddingAfterPipeInput: CheckboxInputWidget;
	private readonly optionPaddingBeforeEqualInput: CheckboxInputWidget;
	private readonly optionPaddingAfterEqualInput: CheckboxInputWidget;
	private readonly optionPaddingBeforeCommaInput: CheckboxInputWidget;
	private readonly optionPaddingAfterCommaInput: CheckboxInputWidget;
	private readonly pagesPaddingBeforePipeInput: CheckboxInputWidget;
	private readonly pagesPaddingAfterPipeInput: CheckboxInputWidget;

	private readonly optionsOrderInput: UnparseSettingsMultiselectWidget;

	constructor() {
		super();

		this.headingPaddingsInput = new CheckboxInputWidget();
		const headingPaddingsInputClone = new CheckboxInputWidget({ disabled: true });

		this.headingPaddingsInput.on('change', (selected: string | boolean) => {
			if (typeof selected === 'string') {
				headingPaddingsInputClone.setValue(selected);
			} else {
				headingPaddingsInputClone.setSelected(selected);
			}
		});

		this.namePaddingInput = new CheckboxInputWidget();
		this.optionsPaddingBeforeOpeningInput = new CheckboxInputWidget();
		this.optionsPaddingAfterOpeningInput = new CheckboxInputWidget();
		this.optionsPaddingBeforeClosingInput = new CheckboxInputWidget();
		this.optionsPaddingBeforePipeInput = new CheckboxInputWidget();
		this.optionsPaddingAfterPipeInput = new CheckboxInputWidget();
		this.optionPaddingBeforeEqualInput = new CheckboxInputWidget();
		this.optionPaddingAfterEqualInput = new CheckboxInputWidget();
		this.optionPaddingBeforeCommaInput = new CheckboxInputWidget();
		this.optionPaddingAfterCommaInput = new CheckboxInputWidget();
		this.pagesPaddingBeforePipeInput = new CheckboxInputWidget();
		this.pagesPaddingAfterPipeInput = new CheckboxInputWidget();

		this.optionsOrderInput = new UnparseSettingsMultiselectWidget();

		const headingLine = new HorizontalLayout({
			content: [
				new LabelWidget({ label: '==' }),
				this.headingPaddingsInput,
				new LabelWidget({ label: 'section-name' }),
				headingPaddingsInputClone,
				new LabelWidget({ label: '==' })
			]
		});
		const definitionLine = new HorizontalLayout({
			content: [
				new LabelWidget({ label: '*' }),
				this.namePaddingInput,
				new LabelWidget({ label: 'gadget-name' }),
				this.optionsPaddingBeforeOpeningInput,
				new LabelWidget({ label: '[' }),
				this.optionsPaddingAfterOpeningInput,
				new LabelWidget({ label: 'flag' }),
				this.optionsPaddingBeforePipeInput,
				new LabelWidget({ label: '|' }),
				this.optionsPaddingAfterPipeInput,
				new LabelWidget({ label: 'key' }),
				this.optionPaddingBeforeEqualInput,
				new LabelWidget({ label: '=' }),
				this.optionPaddingAfterEqualInput,
				new LabelWidget({ label: 'value1' }),
				this.optionPaddingBeforeCommaInput,
				new LabelWidget({ label: ',' }),
				this.optionPaddingAfterCommaInput,
				new LabelWidget({ label: 'value2' }),
				this.optionsPaddingBeforeClosingInput,
				new LabelWidget({ label: ']' }),
				this.pagesPaddingBeforePipeInput,
				new LabelWidget({ label: '|' }),
				this.pagesPaddingAfterPipeInput,
				new LabelWidget({ label: 'page.js' })
			]
		});

		const paddingsFieldset = new FieldsetLayout({
			id: constants.IDENTIFIERS.UNPARSE_PANEL_PADDINGS,
			label: 'Paddings',
			items: [new FieldLayout(new Widget(headingLine)), new FieldLayout(new Widget(definitionLine))]
		});
		const optionsOrderFieldset = new FieldsetLayout({
			label: 'Options ordering',
			items: [new FieldLayout(this.optionsOrderInput)]
		});
		const content = [paddingsFieldset, optionsOrderFieldset];
		this.component = new UnparseSettingsDialog({}, { content });
	}

	get value(): UnparseSettings {
		return {
			headingPaddings: this.headingPaddingsInput.isSelected(),
			namePadding: this.namePaddingInput.isSelected(),
			optionsPaddingBeforeOpening: this.optionsPaddingBeforeOpeningInput.isSelected(),
			optionsPaddingAfterOpening: this.optionsPaddingAfterOpeningInput.isSelected(),
			optionsPaddingBeforeClosing: this.optionsPaddingBeforeClosingInput.isSelected(),
			optionsPaddingBeforePipe: this.optionsPaddingBeforePipeInput.isSelected(),
			optionsPaddingAfterPipe: this.optionsPaddingAfterPipeInput.isSelected(),
			optionPaddingBeforeEqual: this.optionPaddingBeforeEqualInput.isSelected(),
			optionPaddingAfterEqual: this.optionPaddingAfterEqualInput.isSelected(),
			optionPaddingBeforeComma: this.optionPaddingBeforeCommaInput.isSelected(),
			optionPaddingAfterComma: this.optionPaddingAfterCommaInput.isSelected(),
			pagesPaddingBeforePipe: this.pagesPaddingBeforePipeInput.isSelected(),
			pagesPaddingAfterPipe: this.pagesPaddingAfterPipeInput.isSelected(),
			optionsOrder: this.optionsOrderInput.value as UnparseSettings['optionsOrder']
		};
	}

	get cancelled(): boolean {
		return this.component.cancelled === true;
	}

	reset(settings: UnparseSettings): void {
		this.headingPaddingsInput.setSelected(settings.headingPaddings);
		this.namePaddingInput.setSelected(settings.namePadding);
		this.optionsPaddingBeforeOpeningInput.setSelected(settings.optionsPaddingBeforeOpening);
		this.optionsPaddingAfterOpeningInput.setSelected(settings.optionsPaddingAfterOpening);
		this.optionsPaddingBeforeClosingInput.setSelected(settings.optionsPaddingBeforeClosing);
		this.optionsPaddingBeforePipeInput.setSelected(settings.optionsPaddingBeforePipe);
		this.optionsPaddingAfterPipeInput.setSelected(settings.optionsPaddingAfterPipe);
		this.optionPaddingBeforeEqualInput.setSelected(settings.optionPaddingBeforeEqual);
		this.optionPaddingAfterEqualInput.setSelected(settings.optionPaddingAfterEqual);
		this.optionPaddingBeforeCommaInput.setSelected(settings.optionPaddingBeforeComma);
		this.optionPaddingAfterCommaInput.setSelected(settings.optionPaddingAfterComma);
		this.pagesPaddingBeforePipeInput.setSelected(settings.pagesPaddingBeforePipe);
		this.pagesPaddingAfterPipeInput.setSelected(settings.pagesPaddingAfterPipe);

		this.optionsOrderInput.addTags(settings.optionsOrder ?? []);
	}
}
