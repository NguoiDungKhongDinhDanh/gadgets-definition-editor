import type { Segment } from './AST';
import beforeUnloadPreventer from './beforeUnloadPreventer';
import constants from './constants';
import { type ScriptData, getData } from './data';
import notify from './notify';
import { ParseOutcomeStatus, parseGadgetsDefinition } from './parse';
import { addStyles } from './ui/styles';

interface Config {
	/**
	 * Whether the editor should be loaded automatically.
	 */
	auto?: boolean;
}

declare global {
	interface Window {
		readonly gadgetsDefinitionEditor?: Config;
	}
}

const DEPENDENCIES = [
	'mediawiki.api',
	'mediawiki.diff',
	'mediawiki.diff.styles',
	'mediawiki.notification',
	'mediawiki.util',
	'oojs-ui-core',
	'oojs-ui-widgets',
	'oojs-ui-windows',
	'oojs-ui.styles.icons-moderation',
	'oojs-ui.styles.icons-movement',
	'oojs-ui.styles.icons-interactions'
];

const INIT_NOTIFICATIONS = {
	DEPENDENCIES: {
		start: 'Loading dependencies...',
		end: 'Loaded dependencies. Took $1ms.'
	},
	DATA: {
		start: 'Retrieving data...',
		end: 'Retrieved data. Took $1ms.'
	},
	FORM: {
		start: 'Initializing form...',
		end: 'Initialized form. Took $1ms.'
	}
} as const;

function getConfig(): Required<Config> {
	const { searchParams } = new URL(location.href);

	const userConfig: Config = window.gadgetsDefinitionEditor ?? {};
	const defaultConfig: Required<Config> = {
		auto: Boolean(searchParams.get('gde-auto'))
	};
	const config = Object.assign(defaultConfig, userConfig);

	return config;
}

async function tryGetData(api: mw.Api): Promise<ScriptData | undefined> {
	try {
		return await getData(api);
	} catch (error) {
		void notify.persistentError(error);
		return undefined;
	}
}

function getSegments(content: string): Segment[] | undefined {
	const normalOutcome = parseGadgetsDefinition(content);

	if (normalOutcome.status === ParseOutcomeStatus.SUCCESS) {
		return normalOutcome.result;
	}

	void notify.persistentError(normalOutcome.error);
	return undefined;
}

async function initForm(segments: Segment[], data: ScriptData, api: mw.Api): Promise<void> {
	const { createForm } = await import('./ui');

	const form = createForm(segments, data, api);

	$('#mw-content-text').before(form.$element);
	$('#mw-content-text').hide();
}

async function init(): Promise<void> {
	await notify.withNotifications(INIT_NOTIFICATIONS.DEPENDENCIES, async () => mw.loader.using(DEPENDENCIES));

	const api = new mw.Api({
		userAgent: constants.USER_AGENT
	});

	const data = await notify.withNotifications(INIT_NOTIFICATIONS.DATA, async () => tryGetData(api));

	if (!data) {
		return;
	}

	const segments = getSegments(data.pageInfo.content);

	if (!segments) {
		return;
	}

	addStyles();

	// TODO: This might cause freezes.
	await notify.withNotifications(INIT_NOTIFICATIONS.FORM, async () => initForm(segments, data, api));

	beforeUnloadPreventer.attach();
}

void (async () => {
	if (mw.config.get('wgCanonicalNamespace') !== 'MediaWiki' || mw.config.get('wgTitle') !== 'Gadgets-definition') {
		return;
	}

	const config = getConfig();

	if (config.auto) {
		void init();
		return;
	}

	await mw.loader.using(['mediawiki.util']);

	const link = mw.util.addPortletLink(
		'p-cactions',
		'javascript:void(0)',
		'Edit with form',
		'ca-gadgetsdefinitioneditor'
	);

	if (!link) {
		void notify.persistentError('Could not add GDE to menu.');
		return;
	}

	$(link).on('click', () => {
		$(link).hide();
		void init();
	});

	mw.loader.using(['mediawiki.notification']);
})();
