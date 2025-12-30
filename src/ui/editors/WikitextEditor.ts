import type { Wikitext } from '../../AST';
import constants from '../../constants';
import type { ScriptData } from '../../data';
import { FieldLayout, FieldsetLayout, MultilineTextInputWidget } from '../ooui';
import type { UIValidationProblem } from '../validity';
import { SegmentEditor } from './SegmentEditor';
import { EditorMode } from './toolbar/Switcher';

export class WikitextEditor extends SegmentEditor {
	override readonly component: FieldsetLayout;

	private readonly input: MultilineTextInputWidget;

	override readonly mode = EditorMode.WIKITEXT;

	constructor(segment: Wikitext, data: ScriptData) {
		super();

		this.input = new MultilineTextInputWidget({
			classes: [constants.IDENTIFIERS.MAX_WIDTH],
			value: segment.raw,
			autosize: true,
			dir: data.languageInfo.direction
		});

		this.component = new FieldsetLayout({
			classes: [constants.IDENTIFIERS.SEGMENT_WIKITEXT],
			label: 'Wikitext',
			items: [new FieldLayout(this.input)]
		});
	}

	override get value(): string {
		return this.input.getValue();
	}

	override async validate(): Promise<UIValidationProblem[]> {
		return Promise.resolve([]);
	}

	onChange(callback: (editor: this) => void): void {
		this.input.on('change', () => {
			callback(this);
		});
	}
}
