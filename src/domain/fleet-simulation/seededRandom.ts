export type RandomGenerator = () => number;

export const createSeededRandom = (seed: number): RandomGenerator => {
	let state = seed >>> 0;

	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 4294967296;
	};
};
