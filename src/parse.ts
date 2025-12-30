import type { Segment } from './AST';
import { Definition, Heading, Option, Wikitext } from './AST';

export enum ParseOutcomeStatus {
	SUCCESS = 'success',
	FAIL = 'fail'
}

export interface ParseResult {
	status: ParseOutcomeStatus.SUCCESS;
	result: Segment[];
}

interface ParseError {
	status: ParseOutcomeStatus.FAIL;
	error: unknown;
}

export type ParseOutcome = ParseResult | ParseError;

/**
 * Convert all CRLF and CR instances to LF.
 *
 * @param text  The text to be normalized.
 */
export function normalizeLineBreaks(text: string): string {
	return text.replace(/\r\n|\r/g, '\n');
}

/**
 * Parse a line as a heading line.
 *
 * @param line  A line in the file, with no trailing newline.
 * @returns The {@link Heading heading}, if it is one.
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/5402b231dc0928f53c345c4be2b671a35345c7c2/includes/MediaWikiGadgetsDefinitionRepo.php#L192}
 */
export function parseHeadingLine(line: string): Heading | undefined {
	const [_$0, equalSigns, name] = line.match(/^(==+) *([^*:\s|]+)\s*(?<!=)==+\s*$/) ?? [];

	if (!equalSigns || !name) {
		return undefined;
	}

	const level = equalSigns.length;

	return new Heading(line, level, name);
}

/**
 * Parse the second part of a definition line.
 *
 * @param raw  The pipe-separated option list as it is given.
 * @returns A list of parsed options with all whitespace removed.
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/5402b231dc0928f53c345c4be2b671a35345c7c2/includes/MediaWikiGadgetsDefinitionRepo.php#L238}
 */
export function parseOptions(raw: string): Option[] {
	const options: Option[] = [];

	raw = raw.replace(/^[ [\]]+|[ [\]]+$/g, '');

	for (const option of raw.split(/\s*\|\s*/)) {
		if (!option) {
			continue;
		}

		const equalSignIndex = option.indexOf('=');

		if (equalSignIndex === -1) {
			const [key, value] = [option, undefined];

			options.push(new Option(key, value));
			continue;
		}

		const key = option.slice(0, equalSignIndex).trim();
		const value = option.slice(equalSignIndex + 1).trim();

		options.push(new Option(key, value));
	}

	return options;
}

/**
 * Parse the third part of a definition line.
 *
 * @param raw  The pipe-separated page list as it is given.
 * @returns A list of unvalidated page names.
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/5402b231dc0928f53c345c4be2b671a35345c7c2/includes/MediaWikiGadgetsDefinitionRepo.php#L302}
 */
function parsePageList(raw: string): string[] {
	return raw
		.trim()
		.split(/\s*\|\s*/)
		.filter(name => name);
}

/**
 * Parse a line as a definition line.
 *
 * @param line  A line in the file, with no trailing newline.
 * @returns The {@link Definition definition}, if it is one.
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/5402b231dc0928f53c345c4be2b671a35345c7c2/includes/MediaWikiGadgetsDefinitionRepo.php#L211}
 */
export function parseDefinitionLine(line: string): Definition | undefined {
	const pattern = /^(\*+) *([a-zA-Z](?:[-_:.\w ]*[a-zA-Z0-9])?)(?:\s*\[(.*?)\])?\s*((\|[^|]*)+)\s*$/;

	const [_, asterisks, name, optionList, pageList] = line.match(pattern) ?? [];

	if (!asterisks || !name) {
		return undefined;
	}

	const level = asterisks.length;
	const options = optionList ? parseOptions(optionList) : [];
	const pages = parsePageList(pageList);

	return new Definition(line, level, name, options, pages);
}

/**
 * Parse a line in a gadgets definition file.
 *
 * @param line  A line in the file, with no trailing newline.
 * @returns The parsed segment.
 */
export function parseLine(line: string): Segment {
	return parseHeadingLine(line) ?? parseDefinitionLine(line) ?? new Wikitext(line);
}

function _parseGadgetsDefinition(raw: string): ParseOutcome {
	const normalized = normalizeLineBreaks(raw);

	const parsed: Segment[] = [];
	const logicalLine = /^(?:<!--[\s\S]*?-->|.)*$/gm;
	const comment = /<!--[\s\S]*?-->/;

	for (const line of normalized.match(logicalLine) ?? []) {
		const hasComment = comment.test(line);
		const segment = hasComment ? new Wikitext(line) : parseLine(line);
		const lastSegment = parsed.at(-1);

		if (!(lastSegment instanceof Wikitext) || !(segment instanceof Wikitext)) {
			parsed.push(segment);
			continue;
		}

		const newLastSegment = new Wikitext(lastSegment.raw + '\n' + segment.raw);
		parsed.splice(-1, 1, newLastSegment);
	}

	return {
		status: ParseOutcomeStatus.SUCCESS,
		result: parsed
	};
}

/**
 * Parse a gadgets definition file.
 *
 * @param raw  The file's content.
 * @returns The parsed segments, or an {@link ParseErrorCode error}.
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/5402b231dc0928f53c345c4be2b671a35345c7c2/includes/MediaWikiGadgetsDefinitionRepo.php#L183}
 */
export function parseGadgetsDefinition(raw: string): ParseOutcome {
	try {
		return _parseGadgetsDefinition(raw);
	} catch (error) {
		return { status: ParseOutcomeStatus.FAIL, error };
	}
}

/**
 * Remove HTML-like comments from a gadgets definition file.
 *
 * Used only in tests.
 *
 * @param content  The gadgets definition file content to remove comments from.
 * @returns The file's content, without comments.
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/5402b231dc0928f53c345c4be2b671a35345c7c2/includes/MediaWikiGadgetsDefinitionRepo.php#L184}
 */
export function removeComments(content: string): string {
	return content.replace(/<!--[\s\S]*?-->/g, '');
}
