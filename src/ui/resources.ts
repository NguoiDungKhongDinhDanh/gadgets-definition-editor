import constants from '../constants';
import { SourcePageSuffix } from '../Gadget';

export enum ResourcePageType {
	SECTION = 'section',
	NAME = 'name',
	SOURCE = 'source'
}

abstract class Page {
	readonly #title: mw.Title;

	constructor(title: mw.Title) {
		this.#title = title;
	}

	static create<P extends Page>(this: new (title: mw.Title) => P, name: string): P | undefined {
		const title = mw.Title.newFromText(name);
		return title ? new this(title) : undefined;
	}

	get name(): string {
		return this.#title.getPrefixedText();
	}
	get namespace(): number {
		return this.#title.getNamespaceId();
	}
	get title(): string {
		return this.#title.getMainText();
	}

	/**
	 * Used by OOUI classes to convert `data` to input value.
	 */
	abstract toString(): string;

	/**
	 * Used by {@linkcode OO.getHash} via {@linkcode JSON.stringify}.
	 */
	toJSON(): object {
		return { name: this.name };
	}

	createLink(): JQuery {
		const url = mw.util.getUrl(this.name);
		const $link = $('<a>').attr('href', url).text(this.toString());

		return $link;
	}
}

export class ResourcePage extends Page {
	static fromShortName(shortName: string): ResourcePage | undefined {
		return ResourcePage.create(`MediaWiki:${constants.PREFIXES.RESOURCE_PAGE}${shortName}`);
	}

	static fromSectionShortName(sectionName: string): ResourcePage | undefined {
		return ResourcePage.create(`MediaWiki:${constants.PREFIXES.RESOURCE_SECTION_PAGE}${sectionName}`);
	}

	get shortName(): string {
		const prefix = this.isSection ? constants.PREFIXES.RESOURCE_SECTION_PAGE : constants.PREFIXES.RESOURCE_PAGE;

		return this.title.slice(prefix.length);
	}

	get isSection(): boolean {
		return this.title.startsWith(constants.PREFIXES.RESOURCE_SECTION_PAGE);
	}

	get suffix(): SourcePageSuffix | undefined {
		return Object.values(SourcePageSuffix).find(suffix => this.title.endsWith(suffix));
	}

	override toString(): string {
		return this.shortName;
	}
}

export class Category extends Page {
	static fromTitle(title: string): Category | undefined {
		return this.create(`Category:${title}`);
	}

	override toString(): string {
		return this.title;
	}
}
