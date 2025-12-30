import type { Segment } from '../AST';
import constants from '../constants';
import type { ScriptData } from '../data';
import { Unreachable } from '../errors';
import { BidirectionalMap } from './BidirectionalMap';
import ComponentWrapper from './ComponentWrapper';
import { EditorRow } from './editors/EditorRow';
import { FieldLayout, FieldsetLayout, Widget } from './ooui';
import type { UIValidationProblem } from './validity';

export default class Editor extends ComponentWrapper<FieldsetLayout> {
	override readonly component: FieldsetLayout;

	private readonly data: ScriptData;
	private readonly api: mw.Api;

	private readonly fields: FieldLayout[];
	private readonly fieldsToRows: BidirectionalMap<FieldLayout, EditorRow>;

	constructor(segments: Segment[], data: ScriptData, api: mw.Api) {
		super();

		this.data = data;
		this.api = api;

		const rows = segments.map(segment => this.createRow(segment));

		this.fields = rows.map(row => this.createField(row));
		this.fieldsToRows = new BidirectionalMap(this.fields.map((field, index) => [field, rows[index]]));

		this.component = new FieldsetLayout({
			id: constants.IDENTIFIERS.EDITOR,
			label: 'Gadgets definition editor',
			items: this.fields
		});
	}

	get length(): number {
		return this.fields.length;
	}

	private createRow(segment: Segment): EditorRow {
		return new EditorRow(segment, this, this.data, this.api);
	}

	private createField(row: EditorRow): FieldLayout {
		const wrappingWidget = new Widget({
			content: [row.component]
		});

		return new FieldLayout(wrappingWidget, {
			classes: [constants.IDENTIFIERS.ROW]
		});
	}

	private findIndex(field: FieldLayout): number {
		const index = this.fields.indexOf(field);

		if (index === -1) {
			console.error({ field, fields: this.fields });
			throw new Unreachable('Cannot find unattached field');
		}

		return index;
	}

	private getRow(field: FieldLayout): EditorRow {
		const row = this.fieldsToRows.get(field);

		if (row === undefined) {
			console.error({ field, editor: this });
			throw new Unreachable('Row not found');
		}

		return row;
	}

	private getField(row: EditorRow): FieldLayout {
		const field = this.fieldsToRows.getBackward(row);

		if (field === undefined) {
			console.error({ row, editor: this });
			throw new Unreachable('Field not found');
		}

		return field;
	}

	private get rows(): readonly EditorRow[] {
		return this.fields.map(field => this.getRow(field));
	}

	get value(): string {
		return this.rows.map(row => row.value).join('\n');
	}

	async validate(): Promise<UIValidationProblem[]> {
		const problems = [];

		for (const row of this.rows) {
			const subproblems = await row.validate();
			problems.push(...subproblems);
		}

		return problems;
	}

	remove(row: EditorRow): void {
		const field = this.getField(row);
		const index = this.findIndex(field);

		this.fields.splice(index, 1);
		this.fieldsToRows.remove(field);
		field.$element.remove();
	}

	moveUp(row: EditorRow): void {
		const field = this.getField(row);
		const index = this.findIndex(field);

		if (index === 0) {
			return;
		}

		const previousField = this.fields[index - 1];

		this.fields.splice(index - 1, 2, field, previousField);
		field.$element.insertBefore(previousField.$element);
	}

	moveDown(row: EditorRow): void {
		const field = this.getField(row);
		const index = this.findIndex(field);

		if (index === this.rows.length - 1) {
			return;
		}

		const nextField = this.fields[index + 1];

		this.fields.splice(index, 2, nextField, field);
		field.$element.insertAfter(nextField.$element);
	}

	addAfter(segment: Segment, row: EditorRow): void {
		const field = this.getField(row);
		const index = this.findIndex(field);

		const newRow = this.createRow(segment);
		const newField = this.createField(newRow);

		this.fields.splice(index + 1, 0, newField);
		this.fieldsToRows.set(newField, newRow);
		newField.$element.insertAfter(field.$element);
	}
}
