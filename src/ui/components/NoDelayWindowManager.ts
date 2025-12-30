import { WindowManager } from '../ooui';
import component from './component';

type NoDelayWindowManager = InstanceType<typeof NoDelayWindowManager>;

const NoDelayWindowManager = component(WindowManager, [], {
	constructor(config: OO.ui.WindowManager.ConfigOptions = {}) {
		NoDelayWindowManager.super.call(this, config);
	},
	/**
	 * @override
	 */
	getReadyDelay(_window: OO.ui.Window, _data: unknown): number {
		return 0;
	}
});

export default NoDelayWindowManager;
