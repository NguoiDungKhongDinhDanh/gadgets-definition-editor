import ComponentWrapper from '../ComponentWrapper';
import type { FieldsetLayout } from '../ooui';
import type { UIValidationProblem } from '../validity';
import type { EditorMode } from './toolbar/Switcher';

export abstract class SegmentEditor extends ComponentWrapper<FieldsetLayout> {
	abstract readonly mode: EditorMode;

	abstract get value(): string;
	abstract validate(): Promise<UIValidationProblem[]>;
}
