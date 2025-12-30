import constants from '../constants';

export function addStyles(): void {
	const { IDENTIFIERS } = constants;

	mw.util.addCSS(`
		#${IDENTIFIERS.EDITOR} .oo-ui-fieldsetLayout-header,
		#${IDENTIFIERS.EDITOR} .oo-ui-fieldLayout-header {
			max-width: unset;
		}
		#${IDENTIFIERS.EDITOR} > .oo-ui-fieldsetLayout-header {
			padding: 16px;
			font-size: large;
		}

		.${IDENTIFIERS.ROW} {
			margin: 0;
			padding: 16px;
		}
		.${IDENTIFIERS.ROW}:nth-of-type(odd) {
			background: #eee;
		}

		.${IDENTIFIERS.ROW_INNER} {
			flex-wrap: wrap-reverse;
			gap: 16px 16px;
		}
		.${IDENTIFIERS.ROW_INNER} .${IDENTIFIERS.ROW_TOOLBAR} {
			order: 1;
		}
		.${IDENTIFIERS.ROW_INNER} .${IDENTIFIERS.ROW_TOOLBAR} > legend {
			visibility: hidden;
		}
		.${IDENTIFIERS.ROW_INNER} > :not(.${IDENTIFIERS.ROW_TOOLBAR}) {
			flex: 1 0 50%;
		}

		.${IDENTIFIERS.SEGMENT_WIKITEXT} textarea {
			font-family: monospace !important;
			word-break: break-all;
		}

		.${IDENTIFIERS.SEGMENT_HEADING_INNER} {
			flex-wrap: nowrap;
		}
		.${IDENTIFIERS.SEGMENT_HEADING_INNER} > :nth-child(1) {
			flex: 0 0 10em;
		}
		.${IDENTIFIERS.SEGMENT_HEADING_INNER} > :nth-child(2) {
			flex: 1 0 auto;
		}

		.${IDENTIFIERS.SEGMENT_DEFINITION_LEVEL_AND_NAME} {
			flex-wrap: nowrap;
		}
		.${IDENTIFIERS.SEGMENT_DEFINITION_LEVEL_AND_NAME} > :nth-child(1) {
			flex: 0 0 10em;
		}
		.${IDENTIFIERS.SEGMENT_DEFINITION_LEVEL_AND_NAME} > :nth-child(2) {
			flex: 1 0 auto;
		}

		.${IDENTIFIERS.SEGMENT_DEFINITION_OPTIONS_AND_BUTTON} {
			flex-wrap: nowrap;
		}

		.${IDENTIFIERS.OPTIONS_CHECKBOXES} {
			justify-content: space-between;
		}

		#${IDENTIFIERS.EDIT_OPTIONS} {
			margin: 0;
			/* From [[:mw:QuickEdit]] */
			border: 1px solid var(--border-color-base, #a2a9b1);
			padding: 16px;
			background: var(--background-color-interactive, #eaecf0);
		}
		#${IDENTIFIERS.UNPARSE_PANEL_PADDINGS} .oo-ui-labelWidget {
			font-family: monospace;
		}

		#${IDENTIFIERS.SUMMARY_PREVIEW}, #${IDENTIFIERS.CONTENT_PREVIEW} {
			margin: 16px;
		}

		.${IDENTIFIERS.GRAYED_OUT} {
			color: #aaa;
			font-size: smaller;
		}
		.${IDENTIFIERS.HIDDEN} {
			display: none;
		}
		.${IDENTIFIERS.MAX_WIDTH} {
			max-width: unset;
		}
	`);
}
