export type Segment = Wikitext | Heading | Definition;

type NotFirst<T> = T extends [infer _, ...infer NF] ? NF : never;
type NonRawParams<T extends abstract new (..._: never[]) => unknown> = NotFirst<ConstructorParameters<T>>;

interface Node {
	/**
	 * The original content of the segment. Empty for generated nodes.
	 */
	raw: string;
}

function nodeToJSON(node: Node): object {
	const entries = Object.entries(node);

	return Object.fromEntries(entries.filter(([key, _value]) => key !== 'raw'));
}

/**
 * Everything that is neither a {@link Heading heading} nor a {@link Definition definition}.
 */
export class Wikitext implements Node {
	constructor(readonly raw: string) {}

	static synthesized(): Wikitext {
		return new Wikitext('');
	}

	toJSON(): object {
		return { text: this.raw };
	}
}

/**
 * A heading.
 */
export class Heading implements Node {
	constructor(
		readonly raw: string,
		/**
		 * The level of the heading.
		 */
		readonly level: number,
		/**
		 * The name of the heading.
		 */
		readonly name: string
	) {}

	static synthesized(...args: NonRawParams<typeof Heading>): Heading {
		return new Heading('', ...args);
	}

	toJSON(): object {
		return nodeToJSON(this);
	}
}

/**
 * A gadget definition.
 */
export class Definition implements Node {
	constructor(
		readonly raw: string,
		/**
		 * The number of leading asterisks.
		 */
		readonly level: number,
		/**
		 * The name of the gadget.
		 */
		readonly name: string,
		/**
		 * How this gadget is loaded.
		 */
		readonly options: Option[],
		/**
		 * The pages this gadget consists of.
		 */
		readonly pages: string[]
	) {}

	static synthesized(...args: NonRawParams<typeof Definition>): Definition {
		return new Definition('', ...args);
	}

	toJSON(): object {
		return nodeToJSON(this);
	}
}

/**
 * A {@link Definition definition} option.
 */
export class Option {
	constructor(
		/**
		 * The name of the option.
		 */
		readonly key: string,
		/**
		 * The value of the option. `undefined` for flag-like options.
		 */
		readonly value: string | undefined
	) {}
}
