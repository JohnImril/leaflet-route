import { describe, expect, it } from "vitest";
import type { TruckRoute } from "@domain/fleet-simulation";
import { calculateRouteDistanceKm } from "./calculateRouteMetrics";
import { createFleetSimulation, defaultStartPoint, generateRoutes } from "./createFleetSimulation";
import { ROAD_ROUTE_PRESETS } from "./roadRoutePresets";

const omitLastUpdate = (route: TruckRoute) => {
	const routeCopy: Partial<TruckRoute> = { ...route };
	delete routeCopy.lastUpdate;
	return routeCopy;
};

describe("generateRoutes", () => {
	it("provides road-like route presets with valid coordinates", () => {
		expect(ROAD_ROUTE_PRESETS.length).toBeGreaterThanOrEqual(6);

		for (const preset of ROAD_ROUTE_PRESETS) {
			expect(preset.points.length).toBeGreaterThanOrEqual(2);
			expect(preset.points.every((point) => point.lat >= -90 && point.lat <= 90)).toBe(true);
			expect(preset.points.every((point) => point.lng >= -180 && point.lng <= 180)).toBe(true);
		}
	});

	it("creates the requested route and point counts", () => {
		const routes = generateRoutes(defaultStartPoint, 20, 50, { seed: 2026 });

		expect(routes).toHaveLength(20);
		expect(routes.every((route) => route.length === 50)).toBe(true);
	});

	it("keeps coordinates and speed in valid ranges", () => {
		const routes = generateRoutes(defaultStartPoint, 20, 50, { seed: 2026 });
		const points = routes.flat();

		expect(points.every((point) => point.lat >= -90 && point.lat <= 90)).toBe(true);
		expect(points.every((point) => point.lng >= -180 && point.lng <= 180)).toBe(true);
		expect(points.every((point) => point.speed >= 8 && point.speed <= 100)).toBe(true);
	});

	it("is deterministic for equal seeds", () => {
		const first = generateRoutes(defaultStartPoint, 4, 8, { seed: 7 });
		const second = generateRoutes(defaultStartPoint, 4, 8, { seed: 7 });

		expect(first).toEqual(second);
	});

	it("changes route output for different seeds", () => {
		const first = generateRoutes(defaultStartPoint, 4, 8, { seed: 7 });
		const second = generateRoutes(defaultStartPoint, 4, 8, { seed: 8 });

		expect(first).not.toEqual(second);
	});

	it("creates the same initial simulation for the same seed and scenario", () => {
		const first = createFleetSimulation({ seed: 2026, scenarioId: "road-closure", numRoutes: 3, numPoints: 8 });
		const second = createFleetSimulation({ seed: 2026, scenarioId: "road-closure", numRoutes: 3, numPoints: 8 });

		expect(first.map(omitLastUpdate)).toEqual(second.map(omitLastUpdate));
	});

	it("creates routes from static road-like preset endpoints", () => {
		const routes = createFleetSimulation({ seed: 2026, scenarioId: "normal", numRoutes: 8, numPoints: 12 });
		const presetById = new Map(ROAD_ROUTE_PRESETS.map((preset) => [preset.id, preset]));

		for (const route of routes) {
			const preset = presetById.get(route.routePresetId);
			const firstRoutePoint = route.points[0];
			const lastRoutePoint = route.points[route.points.length - 1];
			const firstPresetPoint = preset?.points[0];
			const lastPresetPoint = preset?.points[preset.points.length - 1];

			expect(preset).toBeDefined();
			expect(calculateRouteDistanceKm(route.points)).toBeGreaterThan(0);
			expect([
				[firstPresetPoint?.lat, firstPresetPoint?.lng, lastPresetPoint?.lat, lastPresetPoint?.lng],
				[lastPresetPoint?.lat, lastPresetPoint?.lng, firstPresetPoint?.lat, firstPresetPoint?.lng],
			]).toContainEqual([firstRoutePoint.lat, firstRoutePoint.lng, lastRoutePoint.lat, lastRoutePoint.lng]);
		}
	});
});
