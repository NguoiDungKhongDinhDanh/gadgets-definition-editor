import constants from '../constants';
import ComponentWrapper from './ComponentWrapper';
import { PanelLayout } from './ooui';

abstract class PreviewArea extends ComponentWrapper<PanelLayout> {
	override readonly component = new PanelLayout({
		id: constants.IDENTIFIERS.SUMMARY_PREVIEW,
		classes: [constants.IDENTIFIERS.HIDDEN],
		padded: true,
		expanded: false,
		framed: true
	});

	display(html: string): void {
		this.$element.html(html);
	}

	empty(): void {
		this.display('');
	}

	show(): void {
		this.$element.removeClass(constants.IDENTIFIERS.HIDDEN);
	}

	hide(): void {
		this.$element.addClass(constants.IDENTIFIERS.HIDDEN);
	}
}

export class SummaryPreviewArea extends PreviewArea {
	constructor() {
		super();
		this.$element.attr('id', constants.IDENTIFIERS.SUMMARY_PREVIEW);
	}

	override display(html: string): void {
		super.display(`Preview summary: <span class="comment">${html}</span>`);
	}
}

export class ContentPreviewArea extends PreviewArea {
	constructor() {
		super();
		this.$element.attr('id', constants.IDENTIFIERS.CONTENT_PREVIEW);
	}

	override display(html: string | JQuery): void {
		if (typeof html === 'string') {
			super.display(html);
			return;
		}

		super.empty();
		this.$element.append(html);
	}

	displayDiff(bodyHTML: string): void {
		const $diff = (() => {
			if (bodyHTML === '') {
				return $('<i>').text('No changes made.');
			}

			const $col = $('<col>');
			const $colgroup = $('<colgroup>').append(
				$col.clone().addClass('diff-marker'),
				$col.clone().addClass('diff-content'),
				$col.clone().addClass('diff-marker'),
				$col.clone().addClass('diff-content')
			);
			const $tbody = $('<tbody>').html(bodyHTML);
			const $table = $('<table>').addClass(['diff', 'diff-editfont-monospace']);

			return $table.append($colgroup, $tbody);
		})();

		this.display($diff.prop('outerHTML') as string);
	}
}
