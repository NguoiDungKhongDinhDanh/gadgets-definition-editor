import type { Segment } from '../AST';
import constants from '../constants';
import type { ScriptData } from '../data';
import ComponentWrapper from './ComponentWrapper';
import EditOptionsPanel from './EditOptionsPanel';
import Editor from './Editor';
import { ContentPreviewArea, SummaryPreviewArea } from './PreviewAreas';
import { PanelLayout, ProgressBarWidget } from './ooui';

export default class Form extends ComponentWrapper<PanelLayout> {
	override readonly component: PanelLayout;

	private readonly editor: Editor;
	private readonly editOptionsPanel: EditOptionsPanel;
	private readonly summaryPreviewArea: SummaryPreviewArea;
	private readonly contentPreviewArea: ContentPreviewArea;

	constructor(segments: Segment[], data: ScriptData, api: mw.Api) {
		super();

		this.editor = new Editor(segments, data, api);
		this.editOptionsPanel = new EditOptionsPanel(data);
		this.summaryPreviewArea = new SummaryPreviewArea();
		this.contentPreviewArea = new ContentPreviewArea();

		this.component = new PanelLayout({
			id: constants.IDENTIFIERS.FORM,
			content: [
				this.editor.component,
				this.editOptionsPanel.component,
				this.summaryPreviewArea.component,
				this.contentPreviewArea.component
			],
			expanded: false,
			framed: true
		});
	}

	get newText(): string {
		return this.editor.value;
	}

	get editSummary(): string {
		const summary = this.editOptionsPanel.editSummary.getValue();
		return `${summary}${constants.ADVERTISEMENT}`;
	}

	get markedAsMinor(): boolean {
		return this.editOptionsPanel.markAsMinor.isSelected();
	}

	get submitButton(): EditOptionsPanel['submit'] {
		return this.editOptionsPanel.submit;
	}

	get copyButton(): EditOptionsPanel['copy'] {
		return this.editOptionsPanel.copy;
	}

	get diffButton(): EditOptionsPanel['diff'] {
		return this.editOptionsPanel.diff;
	}

	get previewButton(): EditOptionsPanel['preview'] {
		return this.editOptionsPanel.preview;
	}

	startLoadingPreview(): void {
		const progressBar = new ProgressBarWidget({
			classes: [constants.IDENTIFIERS.MAX_WIDTH]
		});

		this.summaryPreviewArea.hide();
		this.summaryPreviewArea.empty();

		this.contentPreviewArea.show();
		this.contentPreviewArea.display(progressBar.$element);
	}

	displayDiff(summaryHTML: string, diffHTML: string): void {
		this.summaryPreviewArea.display(summaryHTML);
		this.summaryPreviewArea.show();

		this.contentPreviewArea.displayDiff(diffHTML);
		this.contentPreviewArea.show();
	}

	displayPreview(summaryHTML: string, contentHTML: string): void {
		this.summaryPreviewArea.display(summaryHTML);
		this.summaryPreviewArea.show();

		this.contentPreviewArea.display(contentHTML);
		this.contentPreviewArea.show();
	}
}
