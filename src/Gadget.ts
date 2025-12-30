import type { Definition } from './AST';
import type { ResolvedOptions } from './options';
import { collectOptions } from './options';

export enum SourcePageSuffix {
	CSS = '.css',
	JS = '.js',
	JSON = '.json',
	VUE = '.vue'
}

/**
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/d9e4fe3513adffb84339e4656953689b0c546cc8/includes/Gadget.php#L530-L544}
 */
export enum GadgetType {
	GENERAL = 'general',
	STYLES = 'styles'
}

/**
 * Currently unused.
 *
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/49a2100b69c6eefc2b9d231961832e435eccc79a/includes/Gadget.php#L35}
 */
export class Gadget {
	constructor(
		readonly name: string,
		readonly options: ResolvedOptions,
		readonly pages: string[]
	) {}

	static fromDefinition(definition: Definition): Gadget {
		const { name, options, pages } = definition;
		const [resolvedOptions, _unknownOptions] = collectOptions(options);

		return new Gadget(name, resolvedOptions, pages);
	}

	get js(): string[] {
		return this.pages.filter(page => page.endsWith(SourcePageSuffix.JS));
	}

	get css(): string[] {
		return this.pages.filter(page => page.endsWith(SourcePageSuffix.CSS));
	}

	get json(): string[] {
		return this.pages.filter(page => page.endsWith(SourcePageSuffix.JSON));
	}

	get vue(): string[] {
		return this.pages.filter(page => page.endsWith(SourcePageSuffix.VUE));
	}

	get sourcePages(): string[] {
		return [...this.js, ...this.css, ...this.json, ...this.vue];
	}

	get isPackaged(): boolean {
		const { options, js: jsPages } = this;

		return !!options.package && !!options.ResourceLoader && jsPages.length !== 0;
	}

	get type(): GadgetType {
		const { options } = this;
		const dependencies = options.dependencies ?? [];

		if (options.type === 'styles') {
			return GadgetType.STYLES;
		}

		if (options.type === 'general') {
			return GadgetType.GENERAL;
		}

		if (this.css.length > 0 && this.js.length === 0 && dependencies.length === 0) {
			return GadgetType.STYLES;
		}

		return GadgetType.GENERAL;
	}
}
