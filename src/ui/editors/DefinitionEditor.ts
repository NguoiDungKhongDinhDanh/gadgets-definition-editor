import { Definition } from '../../AST';
import constants from '../../constants';
import type { ScriptData } from '../../data';
import type { ResolvedOptions } from '../../options';
import { collectOptions } from '../../options';
import { parseDefinitionLine, parseOptions } from '../../parse';
import { sortedOptions, unparseDefinition, unparseOptions } from '../../unparse';
import LevelInputWidget from '../components/LevelInputWidget';
import ResourcePageInputWidget from '../components/ResourcePageInputWidget';
import SourcePageMultiselectWidget from '../components/SourcePageMultiselectWidget';
import {
	ButtonWidget,
	FieldLayout,
	FieldsetLayout,
	HorizontalLayout,
	MultilineTextInputWidget,
	PanelLayout,
	Widget
} from '../ooui';
import { ResourcePageType } from '../resources';
import { UIValidationProblem } from '../validity';
import windows from '../windows';
import { OptionsPanel } from './OptionsPanel';
import { SegmentEditor } from './SegmentEditor';
import { EditorMode } from './toolbar/Switcher';

export class DefinitionEditor extends SegmentEditor {
	override readonly component: FieldsetLayout;

	private readonly data: ScriptData;

	private readonly levelInput: LevelInputWidget;
	private readonly nameInput: ResourcePageInputWidget;
	private readonly pagesInput: SourcePageMultiselectWidget;

	private readonly optionsInput: MultilineTextInputWidget;
	private readonly optionsPanelButton: ButtonWidget;

	override readonly mode = EditorMode.DEFINITION;

	constructor(segment: Definition, data: ScriptData, api: mw.Api) {
		super();

		this.data = data;

		this.levelInput = new LevelInputWidget({
			value: segment.level.toString(),
			min: 1,
			step: 1,
			pageStep: 1
		});
		this.nameInput = new ResourcePageInputWidget(
			{
				classes: [constants.IDENTIFIERS.MAX_WIDTH],
				value: segment.name
			},
			{ api, kind: ResourcePageType.NAME }
		);

		this.pagesInput = new SourcePageMultiselectWidget({}, { api });
		this.pagesInput.addTags(segment.pages);

		this.optionsInput = new MultilineTextInputWidget({
			classes: [constants.IDENTIFIERS.MAX_WIDTH],
			value: unparseOptions(segment.options, this.data.unparseSettings),
			disabled: true,
			autosize: true,
			rows: 1
		});
		this.optionsPanelButton = new ButtonWidget({
			label: 'Edit',
			icon: 'window'
		});
		this.optionsPanelButton.on('click', () => {
			const options = parseOptions(this.options);
			const [resolved, unknown] = collectOptions(options);

			const panel = new OptionsPanel(data, api);
			panel.reset(resolved, unknown);

			const window = windows.open(panel.component);

			window.closing.then(() => {
				if (panel.cancelled) {
					return;
				}

				const oldOptions = parseOptions(this.options);
				const oldOptionsOrder = oldOptions.map(option => option.key as keyof ResolvedOptions);

				const newOptions = sortedOptions(panel.value, oldOptionsOrder);
				const unparsed = unparseOptions(newOptions, data.unparseSettings);

				this.optionsInput.setValue(unparsed);
			});
		});

		const levelAndNameFields = new HorizontalLayout({
			classes: [constants.IDENTIFIERS.SEGMENT_DEFINITION_LEVEL_AND_NAME],
			items: [
				new FieldLayout(this.levelInput, {
					label: 'Level:',
					align: 'top'
				}),
				new FieldLayout(this.nameInput, {
					label: 'Name:',
					align: 'top'
				})
			]
		});
		const optionsField = new FieldLayout(
			new Widget({
				content: [
					new HorizontalLayout({
						classes: [constants.IDENTIFIERS.SEGMENT_DEFINITION_OPTIONS_AND_BUTTON],
						items: [this.optionsInput, this.optionsPanelButton]
					})
				]
			}),
			{ label: 'Options:', align: 'top' }
		);
		const pagesField = new FieldLayout(this.pagesInput, { label: 'Source pages:', align: 'top' });
		const fields = new PanelLayout({
			expanded: false,
			content: [levelAndNameFields, optionsField, pagesField]
		});

		this.component = new FieldsetLayout({
			classes: [constants.IDENTIFIERS.SEGMENT_DEFINITION],
			label: 'Definition',
			items: [new FieldLayout(new Widget({ content: [fields] }))]
		});
	}

	get level(): number {
		return this.levelInput.getNumericValue();
	}
	get name(): string {
		return this.nameInput.getValue();
	}
	get options(): string {
		return this.optionsInput.getValue();
	}
	get pages(): string[] {
		return this.pagesInput.getValue() as string[];
	}

	private toNode(): Definition {
		const options = parseOptions(this.options);

		return Definition.synthesized(this.level, this.name, options, this.pages);
	}

	get value(): string {
		return unparseDefinition(this.toNode(), this.data.unparseSettings);
	}

	override async validate(): Promise<UIValidationProblem[]> {
		const problems: UIValidationProblem[] = [];

		if (parseDefinitionLine(`* ${this.name}|`) === undefined) {
			problems.push(UIValidationProblem.error(this.nameInput, `Invalid gadget name: ${this.name}`));
		}

		return Promise.resolve(problems);
	}
}
