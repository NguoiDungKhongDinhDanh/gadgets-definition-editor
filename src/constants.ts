/**
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/df0450feb35a4c764c5b027e9bd026a70fc9e0e0/includes/GadgetRepo.php#L15}
 */
const PREFIXES = Object.freeze({
	RESOURCE_PAGE: 'Gadget-',
	RESOURCE_SECTION_PAGE_ONLY: 'section-',
	RESOURCE_SECTION_PAGE: 'Gadget-section-'
});

const IDENTIFIERS = Object.freeze({
	NOTIFICATION: 'gadgets-definition-editor',
	NOTIFICATION_EDIT: 'gde-notification-edit',
	NOTIFICATION_COPY: 'gde-notification-copy',

	WINDOW: 'gde-window',

	FORM: 'gde-form',
	EDITOR: 'gde-editor',
	ROW: 'gde-row',
	ROW_INNER: 'gde-row-inner',
	ROW_TOOLBAR: 'gde-row-toolbar',
	SEGMENT_WIKITEXT: 'gde-segment-wikitext',
	SEGMENT_HEADING: 'gde-segment-heading',
	SEGMENT_HEADING_INNER: 'gde-segment-heading-inner',
	SEGMENT_DEFINITION: 'gde-segment-definition',
	SEGMENT_DEFINITION_LEVEL_AND_NAME: 'gde-segment-definition-level-and-name',
	SEGMENT_DEFINITION_OPTIONS_AND_BUTTON: 'gde-segment-definition-options-and-button',
	OPTIONS_CHECKBOXES: 'gde-options-checkboxes',
	EDIT_OPTIONS: 'gde-editoptions',
	EDIT_OPTIONS_SUMMARY: 'gde-editoptions-summary',
	EDIT_OPTIONS_MINOR: 'gde-editoptions-minor',
	EDIT_OPTIONS_BUTTONS: 'gde-editoptions-buttons',
	UNPARSE_PANEL_PADDINGS: 'gde-editoptions-unparse-paddings',
	SUMMARY_PREVIEW: 'gde-summary-preview',
	CONTENT_PREVIEW: 'gde-content-preview',

	GRAYED_OUT: 'gde-grayedout',
	HIDDEN: 'gde-hidden',
	MAX_WIDTH: 'gde-maxwidth'
});

const ADVERTISEMENT = ' ([[:metawikimedia:User:NDKDD/GDE|GadgetsDefinitionEditor]])';
const USER_AGENT = 'GadgetsDefinitionEditor (https://meta.wikimedia.org/wiki/User:NDKDD/GDE)';
const UNPARSE_SETTINGS_PAGE = 'MediaWiki:Gadgets-definition/gde-unparse.json';

export default {
	IDENTIFIERS,
	PREFIXES,
	ADVERTISEMENT,
	USER_AGENT,
	UNPARSE_SETTINGS_PAGE
};
