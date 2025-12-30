/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Element, NumberInputWidget, Widget } from '../ooui';

const CONSTRUCTOR = 'constructor';
type Constructor = typeof CONSTRUCTOR;

const STATIC = 'static';
type Static = typeof STATIC;

type NonPrototype = Constructor | Static;

// For attribution: https://stackoverflow.com/a/75872704
type TupleToIntersectionInner<T extends unknown[]> =
	{ [K in keyof T]: (x: T[K]) => void } extends Record<number, (x: infer I) => void> ? I : never;
type TupleToIntersection<T extends unknown[]> =
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	T extends never[] ? {} : TupleToIntersectionInner<T>;

// For attribution: https://stackoverflow.com/a/56370310
type NotLast<T extends any[]> = T extends [...infer NL, (infer _)?] ? NL : never;
type Last<T extends any[]> = T extends [...infer _, (infer L)?] ? L : never;

interface NonProtoPropertiesSpecs {
	constructor: (..._: any) => void;
	static?: object;
}
type PropertiesSpecs<M extends object> = NonProtoPropertiesSpecs & {
	[K in keyof M]?: Required<M>[K];
};

// For attribution: https://stackoverflow.com/a/51691257
type AnyConstructor<T> = T extends any ? new (..._: any) => T : never;

// NumberInputWidget is not assignable to Element for some reason.
type OOUIElement = Element | NumberInputWidget;
type OOUIWidgetClass = AnyConstructor<OOUIElement>;
interface OOUIMixinClass {
	prototype: unknown;
}
interface OOUIChildClass {
	super: unknown;
}

type WithPrototype<Parent> = Parent extends OOUIMixinClass ? Pick<Parent, 'prototype'> : object;
type WithSuper<Parent> = Parent extends OOUIChildClass ? Pick<Parent, 'super'> : object;
interface PossiblyWithStatic<Parent> {
	static?: Parent extends { static: unknown } ? Partial<Parent[Static]> : object;
}

type OOUIWidget<C> = C extends abstract new (..._: any) => infer T ? T : never;
type OOUIMixin<C> = C extends { prototype: infer T } ? T : never;

export type NoProps = undefined;

type Extends<A, B> = A extends B ? true : false;
type Or<A extends boolean, B extends boolean> = A extends true ? true : B extends true ? true : false;

type GetOrObject<T, K extends keyof any> = K extends keyof T ? Required<T>[K] : object;
type WithMixedStaticProps<Parent extends OOUIWidgetClass & OO.ConstructorLike, Props extends NonProtoPropertiesSpecs> =
	Or<Extends<Static, keyof Parent>, Extends<Static, keyof Props>> extends true
		? { readonly static: GetOrObject<Parent, Static> & GetOrObject<Props, Static> }
		: object;

type DefaultToObject<NonMethodProps> = NonMethodProps extends NoProps ? object : NonMethodProps;

type NewWidgetClass<
	Parent extends OOUIWidgetClass & OO.ConstructorLike,
	MixedBase extends OOUIElement,
	Props extends NonProtoPropertiesSpecs,
	OriginalParams extends any[] = NotLast<Parameters<Props[Constructor]>>,
	NonMethodProps = Last<Parameters<Props[Constructor]>>,
	Params extends any[] = NonMethodProps extends NoProps ? OriginalParams : Parameters<Props[Constructor]>
> = WithMixedStaticProps<Parent, Props> &
	WithPrototype<Parent & { prototype: Omit<Props, NonPrototype> }> & {
		new (..._: Params): MixedBase & Omit<Props, NonPrototype>;
		readonly super: WithPrototype<Parent> &
			WithSuper<Parent> &
			(new (..._: ConstructorParameters<Parent>) => InstanceType<Parent>);
	};

// Yes, this is necessary for code insight features.
export default function component<
	Parent extends OOUIWidgetClass & OO.ConstructorLike,
	Mixins extends (OOUIMixinClass & OO.ConstructorLike)[],
	Props extends PropertiesSpecs<InstanceType<Parent>>,
	// NumberInputWidget is not assignable to Widget for some reason.
	WidgetMonkeypatch = InstanceType<Parent> extends NumberInputWidget ? Widget : object,
	NonMethodProps = DefaultToObject<Last<Parameters<Props[Constructor]>>>,
	MixedBase extends OOUIElement = OOUIWidget<Parent> &
		TupleToIntersection<{ [I in keyof Mixins]: OOUIMixin<Mixins[I]> }>,
	NewWidgetThis = MixedBase & Omit<Props, NonPrototype> & NonMethodProps
>(
	parent: Parent,
	mixins: Mixins,
	properties: PossiblyWithStatic<Parent> & Props & ThisType<NewWidgetThis>
): NewWidgetClass<Parent, MixedBase, Props & NonMethodProps & WidgetMonkeypatch> {
	function Widget(this: NewWidgetThis, ...args: Parameters<Props[Constructor]>): void {
		properties.constructor.apply(this, args);
	}

	OO.inheritClass(Widget, parent);

	for (const mixin of mixins) {
		OO.mixinClass(Widget, mixin);
	}

	if (Object.hasOwn(properties, STATIC)) {
		const _Widget = Widget as typeof Widget & { [STATIC]: unknown };

		Object.assign(_Widget, {
			[STATIC]: Object.assign(_Widget[STATIC] ?? {}, properties[STATIC])
		});
	}

	const descriptors = Object.getOwnPropertyDescriptors(properties);

	for (const [name, descriptor] of Object.entries(descriptors)) {
		if (name !== CONSTRUCTOR && name !== STATIC) {
			Object.defineProperty(Widget.prototype, name, descriptor);
		}
	}

	return Widget as unknown as NewWidgetClass<Parent, MixedBase, Props & NonMethodProps & WidgetMonkeypatch>;
}

export interface Abortable {
	abort: () => void;
}
