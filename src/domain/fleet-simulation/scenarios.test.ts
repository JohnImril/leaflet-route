import { describe, expect, it } from "vitest";
import { defaultStartPoint, generateRoutes } from "./createFleetSimulation";
import { calculateRouteMetrics } from "./calculateRouteMetrics";
import { scenarioOptions, scenarios } from "./scenarios";

const route = generateRoutes(defaultStartPoint, 1, 12, { seed: 2026 })[0];

describe("scenario effects", () => {
	it("defines operationally different scenario parameters", () => {
		const signatures = scenarioOptions.map((scenario) =>
			[scenario.speedFactor, scenario.delayFactor, scenario.riskBias, scenario.riskZones.length].join(":")
		);

		expect(new Set(signatures).size).toBe(scenarioOptions.length);
	});

	it("rush hour lowers current speed or increases delay versus normal day", () => {
		const normal = calculateRouteMetrics({
			points: route,
			currentPointIndex: 3,
			scenario: scenarios.normal,
			routeBias: 0.2,
		});
		const rushHour = calculateRouteMetrics({
			points: route,
			currentPointIndex: 3,
			scenario: scenarios["rush-hour"],
			routeBias: 0.2,
		});

		expect(rushHour.currentSpeed).toBeLessThan(normal.currentSpeed);
		expect(rushHour.delayMinutes).toBeGreaterThanOrEqual(normal.delayMinutes);
	});

	it("bad weather raises risk or delay compared with normal day", () => {
		const normal = calculateRouteMetrics({
			points: route,
			currentPointIndex: 4,
			scenario: scenarios.normal,
			routeBias: 0.25,
		});
		const badWeather = calculateRouteMetrics({
			points: route,
			currentPointIndex: 4,
			scenario: scenarios["bad-weather"],
			routeBias: 0.25,
		});

		expect(badWeather.delayMinutes).toBeGreaterThanOrEqual(normal.delayMinutes);
		expect(["medium", "high"]).toContain(badWeather.riskLevel);
	});

	it("road closure uses high-risk zones and affects metrics beyond label text", () => {
		const roadClosure = scenarios["road-closure"];
		const metrics = calculateRouteMetrics({
			points: route,
			currentPointIndex: 4,
			scenario: roadClosure,
			routeBias: 0.5,
			zoneWarnings: roadClosure.riskZones.map((zone) => zone.label),
		});

		expect(roadClosure.riskZones.some((zone) => zone.riskLevel === "high")).toBe(true);
		expect(metrics.riskLevel).toBe("high");
		expect(metrics.delayMinutes).toBeGreaterThan(0);
	});
});
