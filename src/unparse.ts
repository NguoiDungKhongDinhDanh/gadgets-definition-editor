import type { Option, Segment } from './AST';
import { Definition, Heading } from './AST';
import type { ResolvedOptions } from './options';
import type {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parseDefinitionLine,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parseGadgetsDefinition,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parseHeadingLine,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parseLine,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parseOptions
} from './parse';

interface _UnparseSettings {
	headingPaddings: boolean;

	namePadding: boolean;

	optionsPaddingBeforeOpening: boolean;
	optionsPaddingAfterOpening: boolean;
	optionsPaddingBeforeClosing: boolean;
	optionsPaddingBeforePipe: boolean;
	optionsPaddingAfterPipe: boolean;

	optionPaddingBeforeEqual: boolean;
	optionPaddingAfterEqual: boolean;
	optionPaddingBeforeComma: boolean;
	optionPaddingAfterComma: boolean;

	pagesPaddingBeforePipe: boolean;
	pagesPaddingAfterPipe: boolean;

	optionsOrder: null | readonly (keyof ResolvedOptions)[];
}
export type UnparseSettings = Readonly<_UnparseSettings>;

export const defaultUnparseSettings = Object.freeze({
	headingPaddings: true,
	namePadding: true,
	optionsPaddingBeforeOpening: false,
	optionsPaddingAfterOpening: false,
	optionsPaddingBeforeClosing: false,
	optionsPaddingBeforePipe: false,
	optionsPaddingAfterPipe: false,
	optionPaddingBeforeEqual: false,
	optionPaddingAfterEqual: false,
	optionPaddingBeforeComma: false,
	optionPaddingAfterComma: false,
	pagesPaddingBeforePipe: false,
	pagesPaddingAfterPipe: false,
	optionsOrder: null
} as UnparseSettings);

function getPadding(setting: boolean): ' ' | '' {
	return setting ? ' ' : '';
}

/**
 * Join a definition back to a line.
 *
 * @param segment  The segment as returned by {@linkcode parseHeadingLine}.
 */
export function unparseHeading(segment: Heading, settings: UnparseSettings): string {
	const equals = '='.repeat(segment.level);
	const padding = getPadding(settings.headingPaddings);

	return `${equals}${padding}${segment.name}${padding}${equals}`;
}

/**
 * Join the given option back to a string.
 */
export function unparseOption(option: Option, settings: UnparseSettings): string {
	if (option.value === undefined) {
		return option.key;
	}

	const paddingBeforeEqual = getPadding(settings.optionPaddingBeforeEqual);
	const paddingAfterEqual = getPadding(settings.optionPaddingAfterEqual);

	const paddingBeforeComma = getPadding(settings.optionPaddingBeforeComma);
	const paddingAfterComma = getPadding(settings.optionPaddingAfterComma);
	const separator = `${paddingBeforeComma},${paddingAfterComma}`;

	const valueParts = option.value.split(/\s*,\s*/);

	return `${option.key}${paddingBeforeEqual}=${paddingAfterEqual}${valueParts.join(separator)}`;
}

export function sortedOptions(options: Option[], order: readonly (keyof ResolvedOptions)[] | null): Option[] {
	const clone: Option[] = [...options];

	if (order !== null) {
		const getPriority = (key: string): number => {
			const index = order.indexOf(key as keyof ResolvedOptions);
			return index === -1 ? clone.length : index;
		};

		clone.sort((first, second) => {
			const firstPriority = getPriority(first.key);
			const secondPriority = getPriority(second.key);

			return firstPriority - secondPriority;
		});
	}

	return clone;
}

/**
 * Join the given options back to a pipe-separated list, brackets not included.
 *
 * @param options  The options as returned by {@linkcode parseOptions}.
 */
export function unparseOptions(options: Option[], settings: UnparseSettings): string {
	const paddingBeforePipe = getPadding(settings.optionsPaddingBeforePipe);
	const paddingAfterPipe = getPadding(settings.optionsPaddingAfterPipe);
	const separator = `${paddingBeforePipe}|${paddingAfterPipe}`;

	return sortedOptions(options, settings.optionsOrder)
		.map(option => unparseOption(option, settings))
		.join(separator);
}

/**
 * Join the given options back to a pipe-separated list, brackets included.
 *
 * @param options  The options as returned by {@linkcode parseOptions}.
 */
export function unparseOptionList(options: Option[], settings: UnparseSettings): string {
	if (options.length === 0) {
		return '';
	}

	const paddingBeforeOpening = getPadding(settings.optionsPaddingBeforeOpening);
	const paddingAfterOpening = getPadding(settings.optionsPaddingAfterOpening);
	const opening = `${paddingBeforeOpening}[${paddingAfterOpening}`;

	const paddingBeforeClosing = getPadding(settings.optionsPaddingBeforeClosing);
	const closing = `${paddingBeforeClosing}]`;

	return `${opening}${unparseOptions(options, settings)}${closing}`;
}

/**
 * Join a definition back to a line.
 *
 * @param segment  The segment as returned by {@linkcode parseDefinitionLine}.
 */
export function unparseDefinition(segment: Definition, settings: UnparseSettings): string {
	const asterisks = '*'.repeat(segment.level);

	const namePadding = getPadding(settings.namePadding);
	const options = unparseOptionList(segment.options, settings);

	const paddingBeforePipe = getPadding(settings.pagesPaddingBeforePipe);
	const paddingAfterPipe = getPadding(settings.pagesPaddingAfterPipe);
	const separator = `${paddingBeforePipe}|${paddingAfterPipe}`;

	const pages = segment.pages.map(page => `${separator}${page}`);

	return `${asterisks}${namePadding}${segment.name}${options}${pages.join('')}`;
}

/**
 * Join the given segment back to a line.
 *
 * @param segment  The segment as returned by {@linkcode parseLine}.
 */
function unparseSegment(segment: Segment, settings: UnparseSettings): string {
	if (segment instanceof Definition) {
		return unparseDefinition(segment, settings);
	}

	if (segment instanceof Heading) {
		return unparseHeading(segment, settings);
	}

	return segment.raw;
}

/**
 * Join the given segments back to a gadgets definition file.
 *
 * @param segments  The segments as returned by {@linkcode parseGadgetsDefinition}.
 */
export default function unparseGadgetsDefinition(segments: Segment[], settings: UnparseSettings): string {
	return segments.map(segment => unparseSegment(segment, settings)).join('\n');
}
