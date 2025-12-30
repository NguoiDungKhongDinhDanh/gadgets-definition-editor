import { Heading } from '../../AST';
import constants from '../../constants';
import type { ScriptData } from '../../data';
import { parseHeadingLine } from '../../parse';
import { unparseHeading } from '../../unparse';
import LevelInputWidget from '../components/LevelInputWidget';
import ResourcePageInputWidget from '../components/ResourcePageInputWidget';
import { FieldLayout, FieldsetLayout, HorizontalLayout, Widget } from '../ooui';
import { ResourcePageType } from '../resources';
import { UIValidationProblem, getValidity } from '../validity';
import { SegmentEditor } from './SegmentEditor';
import { EditorMode } from './toolbar/Switcher';

export class HeadingEditor extends SegmentEditor {
	override readonly component: FieldsetLayout;

	private readonly data: ScriptData;

	private readonly levelInput: LevelInputWidget;
	private readonly nameInput: ResourcePageInputWidget;

	override readonly mode = EditorMode.HEADING;

	constructor(segment: Heading, data: ScriptData, api: mw.Api) {
		super();

		this.data = data;

		this.levelInput = new LevelInputWidget({
			classes: [constants.IDENTIFIERS.MAX_WIDTH],
			value: segment.level.toString(),
			min: 2,
			step: 1,
			pageStep: 1
		});
		this.nameInput = new ResourcePageInputWidget(
			{
				classes: [constants.IDENTIFIERS.MAX_WIDTH],
				value: segment.name
			},
			{ api, kind: ResourcePageType.SECTION }
		);

		const fields = new HorizontalLayout({
			classes: [constants.IDENTIFIERS.SEGMENT_HEADING_INNER],
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

		this.component = new FieldsetLayout({
			classes: [constants.IDENTIFIERS.SEGMENT_HEADING],
			label: 'Heading',
			items: [new FieldLayout(new Widget({ content: [fields] }))]
		});
	}

	private get level(): number {
		return this.levelInput.getNumericValue();
	}

	private get name(): string {
		return this.nameInput.getValue();
	}

	private toNode(): Heading {
		return Heading.synthesized(this.level, this.name);
	}

	override get value(): string {
		return unparseHeading(this.toNode(), this.data.unparseSettings);
	}

	override async validate(): Promise<UIValidationProblem[]> {
		const problems: UIValidationProblem[] = [];

		if (await getValidity(this.levelInput)) {
			problems.push(UIValidationProblem.warning(this.levelInput, `Invalid heading level: ${this.level}`));
		}

		if (parseHeadingLine(this.value) === undefined) {
			problems.push(UIValidationProblem.error(this.nameInput, `Invalid heading name: ${this.name}`));
		}

		return problems;
	}
}
