import { describe, expect, it } from "vitest";
import { limitActivityEvents } from "./activityEvents";
import type { FleetEvent, SpeedMultiplier } from "./types";
import { createFleetSimulation } from "./createFleetSimulation";
import { simulationConfig } from "./simulationConfig";
import { scenarios } from "./scenarios";
import { updateFleetPositions } from "./updateFleetPositions";

const createRoutesNearCompletion = () => {
	const routes = createFleetSimulation({
		seed: 2026,
		scenarioId: "normal",
		numRoutes: 1,
		numPoints: 5,
	});

	return routes.map((route) => ({
		...route,
		currentPointIndex: route.points.length - 2,
		progressPercent: 75,
		status: "on-time" as const,
		etaMinutes: 4,
		delayMinutes: 1,
	}));
};

describe("updateFleetPositions", () => {
	it.each([
		[1, 1],
		[2, 2],
		[4, 4],
	] satisfies Array<[SpeedMultiplier, number]>)(
		"moves a route by the expected amount for %sx speed",
		(speedMultiplier, expectedStep) => {
			const routes = createFleetSimulation({
				seed: 2026,
				scenarioId: "normal",
				numRoutes: 1,
				numPoints: 10,
			});

			const update = updateFleetPositions({
				routes,
				scenario: scenarios.normal,
				speedMultiplier,
				tick: 1,
			});

			expect(update.routes[0].currentPointIndex).toBe(expectedStep);
		}
	);

	it("does not move beyond the final route point", () => {
		const routes = createRoutesNearCompletion();

		const update = updateFleetPositions({
			routes,
			scenario: scenarios.normal,
			speedMultiplier: 4,
			tick: 1,
		});

		expect(update.routes[0].currentPointIndex).toBe(update.routes[0].points.length - 1);
	});

	it("marks completed routes with zero ETA and delay", () => {
		const routes = createRoutesNearCompletion();

		const update = updateFleetPositions({
			routes,
			scenario: scenarios.normal,
			speedMultiplier: 1,
			tick: 1,
		});

		expect(update.routes[0].status).toBe("completed");
		expect(update.routes[0].etaMinutes).toBe(0);
		expect(update.routes[0].delayMinutes).toBe(0);
	});

	it("keeps route data valid when a selected truck would complete", () => {
		const selectedTruckId = "TRK-01";
		const routes = createRoutesNearCompletion().map((route) => ({ ...route, truckId: selectedTruckId }));

		const update = updateFleetPositions({
			routes,
			scenario: scenarios.normal,
			speedMultiplier: 4,
			tick: 1,
		});

		const selectedRoute = update.routes.find((route) => route.truckId === selectedTruckId);
		expect(selectedRoute?.status).toBe("completed");
		expect(selectedRoute?.currentPointIndex).toBe(selectedRoute ? selectedRoute.points.length - 1 : -1);
	});

	it("caps the activity feed at the configured max length", () => {
		const events: FleetEvent[] = Array.from({ length: simulationConfig.maxActivityEvents + 4 }, (_, index) => ({
			id: `event-${index}`,
			timestamp: "10:00:00",
			truckId: "TRK-01",
			message: `Event ${index}`,
			severity: "low",
		}));

		expect(limitActivityEvents(events)).toHaveLength(simulationConfig.maxActivityEvents);
	});
});
