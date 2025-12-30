import type { Segment } from '../AST';
import beforeunloadpreventer from '../beforeUnloadPreventer';
import constants from '../constants';
import type { ScriptData } from '../data';
import notify from '../notify';
import Form from './Form';
import {
	DIFF_FAILED,
	PREVIEW_FAILED,
	SUMMARY_FAILED,
	getContentPreview,
	getDiff,
	getSummaryPreview,
	handleResult
} from './preview';

function onSubmit(form: Form, api: mw.Api): void {
	form.$element.hide();
	void notify.info('Submitting...', {
		tag: constants.IDENTIFIERS.NOTIFICATION_EDIT
	});

	const text = form.newText;
	const summary = form.editSummary;
	const minor = form.markedAsMinor;

	const params = {
		action: 'edit',
		title: mw.config.get('wgPageName'),
		text,
		summary,
		minor,
		format: 'json',
		formatversion: 2
	};

	api.postWithEditToken(params)
		.done(() => {
			void notify.success('Edited successfully. Reloading...', {
				tag: constants.IDENTIFIERS.NOTIFICATION_EDIT,
				autoHide: false
			});
			beforeunloadpreventer.unattach();
			location.reload();
		})
		.catch((error: unknown, response: unknown) => {
			void notify.persistentError(error, [response], {
				tag: constants.IDENTIFIERS.NOTIFICATION_EDIT
			});
			form.$element.show();
		});
}

async function onCopy(form: Form): Promise<void> {
	await navigator.clipboard.writeText(form.newText);

	void notify.success('Copied new text to clipboard.', {
		tag: constants.IDENTIFIERS.NOTIFICATION_COPY
	});
}

async function onDiff(form: Form, data: ScriptData, api: mw.Api): Promise<void> {
	form.startLoadingPreview();

	const [diffResult, summaryResult] = await Promise.allSettled([
		getDiff(api, data, form.newText),
		getSummaryPreview(api, data, form.editSummary)
	]);

	const diff = handleResult(diffResult) ?? DIFF_FAILED;
	const summary = handleResult(summaryResult) ?? SUMMARY_FAILED;

	form.displayDiff(summary, diff);
}

async function onPreview(form: Form, data: ScriptData, api: mw.Api): Promise<void> {
	form.startLoadingPreview();

	const [previewResult, summaryResult] = await Promise.allSettled([
		getContentPreview(api, data, form.newText),
		getSummaryPreview(api, data, form.editSummary)
	]);

	const preview = handleResult(previewResult) ?? PREVIEW_FAILED;
	const summary = handleResult(summaryResult) ?? SUMMARY_FAILED;

	form.displayPreview(summary, preview);
}

export function createForm(segments: Segment[], data: ScriptData, api: mw.Api): Form {
	const form = new Form(segments, data, api);

	form.submitButton.on('click', () => {
		onSubmit(form, api);
	});

	form.copyButton.on('click', () => {
		void onCopy(form);
	});

	form.diffButton.on('click', () => {
		void onDiff(form, data, api);
	});

	form.previewButton.on('click', () => {
		void onPreview(form, data, api);
	});

	return form;
}
