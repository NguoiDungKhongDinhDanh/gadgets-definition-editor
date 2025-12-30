export class BidirectionalMap<K extends object, V extends object> {
	private readonly forward = new Map<K, V>();
	private readonly backward = new Map<V, K>();

	constructor(entries: [K, V][]) {
		entries.forEach(([key, value]) => {
			this.set(key, value);
		});
	}

	get(key: K): V | undefined {
		return this.forward.get(key);
	}
	getBackward(value: V): K | undefined {
		return this.backward.get(value);
	}

	set(key: K, value: V): void {
		const existingKey = this.backward.get(value);

		if (existingKey && existingKey !== key) {
			console.error({ key, existingKey, map: this });
			throw new Error('Duplicate keys');
		}

		const existingValue = this.forward.get(key);

		if (existingValue) {
			this.backward.delete(existingValue);
		}

		this.forward.set(key, value);
		this.backward.set(value, key);
	}

	remove(key: K): void {
		const value = this.get(key);

		if (value === undefined) {
			return;
		}

		this.forward.delete(key);
		this.backward.delete(value);
	}
}
