import type { Segment } from '../../AST';
import { Definition, Heading, Wikitext } from '../../AST';
import constants from '../../constants';
import type { ScriptData } from '../../data';
import { Unreachable } from '../../errors';
import { parseDefinitionLine, parseHeadingLine } from '../../parse';
import ComponentWrapper from '../ComponentWrapper';
import type Editor from '../Editor';
import { HorizontalLayout } from '../ooui';
import type { UIValidationProblem } from '../validity';
import { DefinitionEditor } from './DefinitionEditor';
import { HeadingEditor } from './HeadingEditor';
import { WikitextEditor } from './WikitextEditor';
import type { AdderData } from './toolbar/Adders';
import type Switcher from './toolbar/Switcher';
import { EditorMode } from './toolbar/Switcher';
import Toolbar from './toolbar/Toolbar';

type SegmentEditor = WikitextEditor | HeadingEditor | DefinitionEditor;

function createSegmentEditor(segment: Segment, data: ScriptData, api: mw.Api): SegmentEditor {
	if (segment instanceof Wikitext) {
		return new WikitextEditor(segment, data);
	}

	if (segment instanceof Heading) {
		return new HeadingEditor(segment, data, api);
	}

	return new DefinitionEditor(segment, data, api);
}

function createDefaultSegment(mode: EditorMode): Segment {
	switch (mode) {
		case EditorMode.WIKITEXT:
			return Wikitext.synthesized();
		case EditorMode.HEADING:
			return Heading.synthesized(2, '');
		case EditorMode.DEFINITION:
			return Definition.synthesized(1, '', [], []);
	}
}

export class EditorRow extends ComponentWrapper<HorizontalLayout> {
	override readonly component: HorizontalLayout;

	private readonly data: ScriptData;
	private readonly api: mw.Api;

	private readonly toolbar: Toolbar;
	private editor: SegmentEditor;

	constructor(segment: Segment, parent: Editor, data: ScriptData, api: mw.Api) {
		super();

		this.data = data;
		this.api = api;

		this.toolbar = new Toolbar();
		this.editor = createSegmentEditor(segment, data, api);

		this.component = new HorizontalLayout({
			classes: [constants.IDENTIFIERS.ROW_INNER],
			items: [this.toolbar.component, this.editor.component]
		});

		const { switcher, movers, remover, adders } = this.toolbar;

		movers.moveUp.on('click', () => {
			parent.moveUp(this);
		});
		movers.moveDown.on('click', () => {
			parent.moveDown(this);
		});

		remover.on('click', async () => {
			if (parent.length === 1) {
				OO.ui.alert('Cannot remove only segment editor.');
				return;
			}

			const prompt = 'You will not be able to undo this action. Remove anyway?';
			const confirmed = await OO.ui.confirm(prompt);

			if (confirmed) {
				parent.remove(this);
			}
		});

		adders.items.forEach(adder => {
			adder.on('click', () => {
				const { mode } = adder.getData() as AdderData;
				const newSegment = createDefaultSegment(mode);

				parent.addAfter(newSegment, this);
			});
		});

		switcher.component.on('select', items => {
			if (items === null || (items instanceof Array && items.length !== 1)) {
				console.error({ items });
				throw new Unreachable('Multiple modes or nothing selected.');
			}

			const item = items instanceof Array ? items[0] : items;
			const mode = item.getData() as EditorMode;

			switch (mode) {
				case EditorMode.WIKITEXT:
					switcher.heading.setDisabled(false);
					switcher.definition.setDisabled(false);
					break;
				case EditorMode.HEADING:
					switcher.heading.setDisabled(false);
					switcher.definition.setDisabled(true);
					break;
				case EditorMode.DEFINITION:
					switcher.heading.setDisabled(true);
					switcher.definition.setDisabled(false);
					break;
			}

			if (mode !== this.mode) {
				this.switchToMode(mode);
			}

			this.toggleHeadingAndDefinitionModes(mode);
		});

		switcher.switchTo(this.mode);
		this.attachChangeListenerIfApplicable();
	}

	get mode(): EditorMode {
		return this.editor.mode;
	}

	get value(): string {
		return this.editor.value;
	}

	async validate(): Promise<UIValidationProblem[]> {
		return this.editor.validate();
	}

	private get switcher(): Switcher {
		return this.toolbar.switcher;
	}

	private attachChangeListenerIfApplicable(): void {
		if (!(this.editor instanceof WikitextEditor)) {
			return;
		}

		this.editor.onChange(editor => {
			this.toggleHeadingAndDefinitionModes(editor.mode);
		});
	}

	private toggleHeadingAndDefinitionModes(mode: EditorMode): void {
		if (mode !== EditorMode.WIKITEXT) {
			return;
		}

		const { switcher, value } = this;

		switcher.heading.setDisabled(parseHeadingLine(value) === undefined);
		switcher.definition.setDisabled(parseDefinitionLine(value) === undefined);
	}

	private switchToMode(mode: EditorMode): void {
		this.component.clearItems();

		const { value } = this;

		switch (mode) {
			case EditorMode.WIKITEXT: {
				const wikitext = new Wikitext(value);
				this.editor = new WikitextEditor(wikitext, this.data);
				break;
			}

			case EditorMode.HEADING: {
				const heading = parseHeadingLine(value);

				if (!heading) {
					console.error({ row: this, value });
					throw new Unreachable('Cannot switch to heading editor.');
				}

				this.editor = new HeadingEditor(heading, this.data, this.api);
				break;
			}

			case EditorMode.DEFINITION: {
				const definition = parseDefinitionLine(value);

				if (!definition) {
					console.error({ row: this, value });
					throw new Unreachable('Cannot switch to definition editor.');
				}

				this.editor = new DefinitionEditor(definition, this.data, this.api);
				break;
			}
		}

		this.attachChangeListenerIfApplicable();
		this.component.addItems([this.toolbar.component, this.editor.component]);
	}
}
