import fs from 'fs';
import path from 'path';
import type { Segment } from './AST';
import { Definition } from './AST';
import { collectOptions } from './options';
import { normalizeLineBreaks, parseGadgetsDefinition, ParseOutcomeStatus, removeComments } from './parse';
import unparseGadgetsDefinition, { defaultUnparseSettings } from './unparse';

const root = path.dirname(__dirname);
const data = path.join(root, 'data');
const dataRaw = path.join(data, 'raw');

class ParseData {
	normalized: string;
	segments: Segment[] | undefined;

	#serialized: string | undefined;
	#reconstructed: string | undefined;

	constructor(public raw: string) {
		this.normalized = normalizeLineBreaks(this.raw);
		this.segments = undefined;

		const outcome = parseGadgetsDefinition(this.raw);

		if (outcome.status === ParseOutcomeStatus.SUCCESS) {
			this.segments = outcome.result;
		}
	}

	get serialized(): string {
		return (this.#serialized ??= JSON.stringify(this.segments, null, '\t'));
	}

	get reconcatenated(): string | undefined {
		return this.segments?.map(segment => segment.raw).join('\n');
	}

	get reconstructed(): string | undefined {
		if (!this.segments) {
			return undefined;
		}

		this.#reconstructed ??= unparseGadgetsDefinition(this.segments, defaultUnparseSettings);

		return this.#reconstructed;
	}
}

class DataFile {
	path: string;
	name: string;
	domain: string;

	#parseData: ParseData | undefined;

	constructor(absolutePath: string) {
		this.path = absolutePath;
		this.name = path.basename(this.path);
		this.domain = this.name.split('.').slice(0, 3).join('.');
	}

	get parseData(): ParseData {
		const raw = fs.readFileSync(this.path).toString();

		return (this.#parseData ??= new ParseData(raw));
	}
}

const dataFiles = fs.readdirSync(dataRaw).map(name => {
	if (!name.endsWith('.wikitext')) {
		throw new Error(`Malformed data file: ${name}`);
	}

	return new DataFile(path.join(dataRaw, name));
});

describe('Parsing is lossless', () => {
	describe('Round-trippability', () => {
		for (const file of dataFiles) {
			const { parseData } = file;

			if (!parseData.segments || parseData.reconstructed === undefined) {
				continue;
			}

			test(file.name, () => {
				expect(parseData.reconcatenated).toBe(parseData.normalized);

				expect(parseData.reconstructed).toMatchSnapshot('reconstructed');
				expect(parseData.serialized).toMatchSnapshot('serialized');
			});
		}
	});
});

describe('Duplicated gadget names', () => {
	for (const file of dataFiles) {
		const commentsStripped = removeComments(file.parseData.normalized);
		const { segments } = new ParseData(commentsStripped);

		if (!segments) {
			continue;
		}

		const definitions = segments.filter(segment => segment instanceof Definition);
		const names = definitions.map(definition => definition.name);

		const seen = new Set();
		const duplicates = new Set();

		for (const name of names) {
			if (seen.has(name)) {
				duplicates.add(name);
			} else {
				seen.add(name);
			}
		}

		test(file.name, () => {
			if (duplicates.size !== 0) {
				expect([...duplicates]).toMatchSnapshot();
			}
		});
	}
});

describe('Resolved and unknown options', () => {
	for (const file of dataFiles) {
		const commentsStripped = removeComments(file.parseData.normalized);
		const { segments } = new ParseData(commentsStripped);

		if (!segments) {
			continue;
		}

		const definitions = segments.filter(segment => segment instanceof Definition);

		describe(file.name, () => {
			for (const definition of definitions) {
				const [resolvedOptions, unknownOptions] = collectOptions(definition.options);

				test(definition.name, () => {
					expect(resolvedOptions).toMatchSnapshot('resolved');
					expect(unknownOptions).toMatchSnapshot('unknown');
				});
			}
		});
	}
});
