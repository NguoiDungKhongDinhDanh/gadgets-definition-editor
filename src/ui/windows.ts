import constants from '../constants';
import NoDelayWindowManager from './components/NoDelayWindowManager';
import type { Window, WindowManager } from './ooui';

function generateRandomName(): string {
	return `${constants.IDENTIFIERS.WINDOW}-${(Math.random() * 1_000_000_000) | 0}`;
}

export default {
	createManager(): WindowManager {
		const manager = new NoDelayWindowManager();
		manager.$element.appendTo(document.body);
		return manager;
	},

	open(window: Window): ReturnType<typeof WindowManager.prototype.openWindow> {
		const manager = this.createManager();
		const name = generateRandomName();

		manager.addWindows({ [name]: window });
		const instance = manager.openWindow(window);

		instance.closed.then(() => {
			manager.destroy();
		});

		return instance;
	}
};
