import { describe, expect, it } from "vitest";
import type { RoutePoint } from "@domain/fleet-simulation";
import { calculateRemainingDistanceKm, calculateRouteMetrics } from "./calculateRouteMetrics";
import { scenarios } from "./scenarios";

const points: RoutePoint[] = [
	{ lat: 52, lng: 0.1, speed: 60 },
	{ lat: 52.001, lng: 0.101, speed: 58 },
	{ lat: 52.002, lng: 0.102, speed: 55 },
	{ lat: 52.003, lng: 0.103, speed: 50 },
	{ lat: 52.004, lng: 0.104, speed: 48 },
];

describe("calculateRouteMetrics", () => {
	it("calculates progress from current point index", () => {
		const metrics = calculateRouteMetrics({
			points,
			currentPointIndex: 2,
			scenario: scenarios.normal,
			routeBias: 0,
		});

		expect(metrics.progressPercent).toBe(50);
		expect(metrics.etaMinutes).toBeGreaterThan(0);
		expect(metrics.distanceKm).toBeGreaterThan(0);
	});

	it("marks a finished route as completed with zero ETA and delay", () => {
		const metrics = calculateRouteMetrics({
			points,
			currentPointIndex: points.length - 1,
			scenario: scenarios.normal,
			routeBias: 0,
		});

		expect(metrics.status).toBe("completed");
		expect(metrics.progressPercent).toBe(100);
		expect(metrics.etaMinutes).toBe(0);
		expect(metrics.delayMinutes).toBe(0);
	});

	it("calculates ETA from remaining route segments", () => {
		const longRoute: RoutePoint[] = [
			{ lat: 52, lng: 0.1, speed: 45 },
			{ lat: 52.03, lng: 0.13, speed: 45 },
			{ lat: 52.06, lng: 0.16, speed: 45 },
			{ lat: 52.09, lng: 0.19, speed: 45 },
			{ lat: 52.12, lng: 0.22, speed: 45 },
		];
		const startMetrics = calculateRouteMetrics({
			points: longRoute,
			currentPointIndex: 0,
			scenario: scenarios.normal,
			routeBias: 0,
		});
		const laterMetrics = calculateRouteMetrics({
			points: longRoute,
			currentPointIndex: 3,
			scenario: scenarios.normal,
			routeBias: 0,
		});

		expect(calculateRemainingDistanceKm(longRoute, 3)).toBeLessThan(calculateRemainingDistanceKm(longRoute, 0));
		expect(laterMetrics.etaMinutes).toBeLessThan(startMetrics.etaMinutes);
	});
});
