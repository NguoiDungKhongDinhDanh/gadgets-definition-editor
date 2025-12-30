import type { NumberInputWidget, Widget } from './ooui';

type OOUIWidget = Widget | NumberInputWidget;

interface HasGetValidity {
	getValidity: () => PromiseLike<void>;
}

export async function getValidity(component: HasGetValidity): Promise<boolean> {
	try {
		await component.getValidity();
		return true;
	} catch {
		return false;
	}
}

export enum ProblemSeverity {
	ERROR = 'error',
	WARNING = 'warning'
}

export class ValidationProblem {
	constructor(
		readonly info: string,
		readonly severity: ProblemSeverity
	) {}

	static error(info: string): ValidationProblem {
		return new ValidationProblem(info, ProblemSeverity.ERROR);
	}

	static warning(info: string): ValidationProblem {
		return new ValidationProblem(info, ProblemSeverity.WARNING);
	}
}

export class UIValidationProblem {
	constructor(
		readonly widget: OOUIWidget,
		readonly problem: ValidationProblem
	) {}

	static error(widget: OOUIWidget, info: string): UIValidationProblem {
		const problem = ValidationProblem.error(info);
		return new UIValidationProblem(widget, problem);
	}

	static warning(widget: OOUIWidget, info: string): UIValidationProblem {
		const problem = ValidationProblem.warning(info);
		return new UIValidationProblem(widget, problem);
	}
}
