import type { Element, HtmlSnippet } from '../ooui';
import { PanelLayout, Process, ProcessDialog } from '../ooui';
import component from './component';

enum Action {
	SAVE = 'save',
	CANCEL = 'cancel',
	RESET = 'reset'
}

interface Props {
	content: (string | Element | HtmlSnippet)[];
	panel?: PanelLayout;
	cancelled?: boolean;
}

type CancellableProcessDialog = InstanceType<typeof CancellableProcessDialog>;

const CancellableProcessDialog = component(ProcessDialog, [], {
	static: {
		actions: [
			{ action: Action.SAVE, label: 'Save', flags: ['primary', 'progressive'] },
			{ action: Action.CANCEL, label: 'Cancel', flags: ['safe', 'close'] }
		]
	},
	constructor(config: OO.ui.ProcessDialog.ConfigOptions, { content }: Props) {
		this.content = content;

		CancellableProcessDialog.super.call(this, config);
	},
	/**
	 * @override
	 */
	initialize(): ProcessDialog {
		CancellableProcessDialog.super.prototype.initialize.call(this);

		this.panel = new PanelLayout({
			content: this.content,
			padded: true,
			expanded: false
		});

		const _this = this as CancellableProcessDialog & { $body: JQuery };
		_this.$body.append(this.panel.$element);

		return this;
	},
	/**
	 * @override
	 */
	getSetupProcess(data?: OO.ui.Dialog.SetupDataMap & Record<string, unknown>): Process {
		return CancellableProcessDialog.super.prototype.getSetupProcess.call(this, data).next(() => {
			this.cancelled = false;
		});
	},
	/**
	 * @override
	 */
	getActionProcess(action: Action): Process {
		if (action === Action.CANCEL) {
			this.cancelled = true;
		}

		return new Process(() => {
			this.close({ action });
		});
	}
});

export default CancellableProcessDialog;
