import { describe, expect, it } from "vitest";
import { createSeededRandom } from "./seededRandom";

describe("createSeededRandom", () => {
	it("returns the same sequence for the same seed", () => {
		const first = createSeededRandom(2026);
		const second = createSeededRandom(2026);

		expect([first(), first(), first()]).toEqual([second(), second(), second()]);
	});

	it("returns different sequences for different seeds", () => {
		const first = createSeededRandom(2026);
		const second = createSeededRandom(2027);

		expect([first(), first(), first()]).not.toEqual([second(), second(), second()]);
	});
});
