import constants from '../constants';
import type { ScriptData } from '../data';
import ComponentWrapper from './ComponentWrapper';
import { UnparseSettingsPanel } from './editors/UnparseSettingsPanel';
import {
	ButtonWidget,
	CheckboxInputWidget,
	FieldLayout,
	FieldsetLayout,
	HorizontalLayout,
	TextInputWidget,
	Widget
} from './ooui';
import windows from './windows';

/**
 * @see {@link https://www.mediawiki.org/wiki/Help:Edit_summary#Key_features mw:Help:Edit summary &sect; Key features}
 */
const MAX_SUMMARY_LENGTH = 500;

export default class EditOptionsPanel extends ComponentWrapper<FieldsetLayout> {
	override readonly component: FieldsetLayout;

	readonly editSummary: TextInputWidget;
	readonly markAsMinor: CheckboxInputWidget;

	readonly submit: ButtonWidget;
	readonly copy: ButtonWidget;
	readonly diff: ButtonWidget;
	readonly preview: ButtonWidget;

	constructor(data: ScriptData) {
		super();

		this.editSummary = new TextInputWidget({
			classes: [constants.IDENTIFIERS.MAX_WIDTH],
			maxLength: MAX_SUMMARY_LENGTH - constants.ADVERTISEMENT.length,
			dir: data.languageInfo.direction
		});
		const editSummaryRow = new FieldLayout(this.editSummary, {
			id: constants.IDENTIFIERS.EDIT_OPTIONS_SUMMARY,
			label: 'Edit summary:',
			align: 'top'
		});

		this.markAsMinor = new CheckboxInputWidget();
		const markAsMinorRow = new FieldLayout(this.markAsMinor, {
			id: constants.IDENTIFIERS.EDIT_OPTIONS_MINOR,
			label: 'Minor edit',
			align: 'inline'
		});

		this.submit = new ButtonWidget({
			label: 'Submit',
			flags: ['primary', 'progressive']
		});
		this.copy = new ButtonWidget({
			label: 'Copy',
			flags: ['secondary', 'progressive']
		});
		this.diff = new ButtonWidget({
			label: 'Diff',
			flags: ['secondary']
		});
		this.preview = new ButtonWidget({
			label: 'Preview',
			flags: ['secondary']
		});

		const unparseSettings = new ButtonWidget({
			label: 'Format settings',
			icon: 'settings',
			framed: false
		});
		unparseSettings.on('click', () => {
			const panel = new UnparseSettingsPanel();
			panel.reset(data.unparseSettings);

			const window = windows.open(panel.component);

			window.closing.then(() => {
				if (!panel.cancelled) {
					data.unparseSettings = panel.value;
				}
			});
		});

		const buttonsRow = new FieldLayout(
			new Widget({
				content: [
					new HorizontalLayout({
						id: constants.IDENTIFIERS.EDIT_OPTIONS_BUTTONS,
						items: [this.submit, this.copy, this.diff, this.preview, unparseSettings]
					})
				]
			})
		);
		this.component = new FieldsetLayout({
			id: constants.IDENTIFIERS.EDIT_OPTIONS,
			items: [editSummaryRow, markAsMinorRow, buttonsRow]
		});
	}
}
