interface Coordinate {
	lat: number;
	lng: number;
	speed: number;
}

interface HotlineProps<T> {
	data: T[];
	getLat: (t: T) => number;
	getLng: (t: T) => number;
	getVal: (t: T) => number;
	options?: HotlineOptions;
	eventHandlers?: HotlineEventHandlers;
}

interface HotlineOptions {
	min: number;
	max: number;
	weight?: number;
	outlineWidth?: number;
	outlineColor?: string;
	palette?: Palette;
	tolerance?: number;
}

interface HotlineEventHandlers {
	[string]: HotlineEventFn;
}

type Palette = Color[];

interface Color {
	r: number;
	g: number;
	b: number;
	t: number;
}

declare module "react-leaflet-hotline" {
	function Hotline<T>(props: HotlineProps<T>): JSX.Element;
	export { Hotline, HotlineProps, HotlineOptions, Palette, Color };
}
