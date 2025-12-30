import type { Option } from './AST';

export type CollectedOptions = [ResolvedOptions, UnknownOptions];

type _UnknownOptions = Option[];
export type UnknownOptions = readonly Option[];

interface _ResolvedOptions {
	ResourceLoader?: true;
	hidden?: true;
	default?: true;
	package?: true;
	requiresES6?: true;

	dependencies?: string[];
	peers?: string[];
	codexIcons?: string[];
	rights?: string[];
	actions?: string[];
	skins?: string[];
	namespaces?: string[];
	categories?: string[];
	contentModels?: string[];

	type?: string;
	supportsUrlLoad?: boolean;
}
export type ResolvedOptions = {
	[K in keyof _ResolvedOptions]: Readonly<Required<_ResolvedOptions>[K]>;
};

/**
 * Collect raw options into structured formats.
 *
 * @param raw  A list of arbitrary {@link Option options}.
 * @returns A record of resolved options and a list of unknown options.
 * @see {@link https://github.com/wikimedia/mediawiki-extensions-Gadgets/blob/5402b231dc0928f53c345c4be2b671a35345c7c2/includes/MediaWikiGadgetsDefinitionRepo.php#L248}
 */
export function collectOptions(raw: Option[]): CollectedOptions {
	const resolved: _ResolvedOptions = {};
	const unknown: _UnknownOptions = [];

	for (const option of raw) {
		const key = option.key as keyof ResolvedOptions;
		const values = option.value?.trim().split(/\s*,\s*/) ?? [];

		switch (key) {
			case 'ResourceLoader':
			case 'requiresES6':
			case 'hidden':
			case 'default':
			case 'package':
				resolved[key] = true;
				break;
			case 'dependencies':
			case 'peers':
			case 'codexIcons':
			case 'rights':
			case 'actions':
			case 'skins':
			case 'namespaces':
			case 'categories':
			case 'contentModels':
				resolved[key] = values;
				break;
			case 'type':
				resolved[key] = values[0] ?? '';
				break;
			case 'supportsUrlLoad':
				resolved[key] = (values[0] ?? '') !== 'false';
				break;
			default:
				unknown.push(option);
				break;
		}
	}

	return [resolved, unknown];
}
