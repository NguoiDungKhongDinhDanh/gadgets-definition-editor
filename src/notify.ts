import constants from './constants';

type NotificationOptions = mw.notification.NotificationOptions;

export interface StartEndNotificationMessages {
	start: string;
	end: string;
}

export default {
	async error(
		message: unknown,
		debugInfo: unknown[] = [],
		options: NotificationOptions = {}
	): Promise<ReturnType<typeof mw.notify>> {
		console.warn(...debugInfo);
		console.error(message);

		return mw.notify(`Error: ${message}`, {
			type: 'error',
			...options
		});
	},
	async persistentError(
		message: unknown,
		debugInfo: unknown[] = [],
		options: NotificationOptions = {}
	): Promise<ReturnType<typeof mw.notify>> {
		return this.error(message, debugInfo, {
			autoHide: false,
			...options
		});
	},

	async warn(
		message: unknown,
		debugInfo: unknown[] = [],
		options: NotificationOptions = {}
	): Promise<ReturnType<typeof mw.notify>> {
		console.warn(...debugInfo);
		console.warn(message);

		return mw.notify(`Warning: ${message}`, {
			type: 'warn',
			...options
		});
	},

	async success(message: string, options: NotificationOptions = {}): Promise<ReturnType<typeof mw.notify>> {
		return mw.notify(message, {
			type: 'success',
			...options
		});
	},

	async info(message: string, options: NotificationOptions = {}): Promise<ReturnType<typeof mw.notify>> {
		return mw.notify(message, {
			type: 'info',
			...options
		});
	},

	async withNotifications<T>(messages: StartEndNotificationMessages, compute: () => T): Promise<Awaited<T>> {
		const randomID = (Math.random() * 1_000_000_000) | 0;
		const tag = `${constants.IDENTIFIERS.NOTIFICATION}-${randomID}`;

		await this.info(messages.start, { tag, autoHide: false });
		const start = performance.now();

		const value = await compute();

		const duration = performance.now() - start;
		await this.success(messages.end.replace('$1', duration.toFixed(0)), { tag, autoHideSeconds: 'short' });

		return value;
	}
};
