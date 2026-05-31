import type { RandomGenerator } from "./seededRandom";
import { createSeededRandom } from "./seededRandom";
import { calculateRouteMetrics, getRouteZoneWarnings } from "./calculateRouteMetrics";
import { simulationConfig } from "./simulationConfig";
import { scenarios } from "./scenarios";
import { ROAD_ROUTE_PRESETS, type RoadRoutePreset } from "./roadRoutePresets";
import type { RoutePoint, ScenarioId, TruckRoute } from "@domain/fleet-simulation";

const driverNames = [
	"Alex Morgan",
	"Sam Rivera",
	"Jamie Chen",
	"Taylor Brooks",
	"Casey Novak",
	"Jordan Ellis",
	"Riley Stone",
	"Morgan Blake",
	"Drew Carter",
	"Avery Lane",
	"Chris Vale",
	"Robin Park",
	"Quinn Foster",
	"Hayden Reed",
	"Sky Kim",
	"Cameron Holt",
	"Reese Ward",
	"Devon Price",
	"Kai Bennett",
	"Rowan Miles",
];

export type GenerateRoutesOptions = {
	seed?: number;
	rng?: RandomGenerator;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const interpolatePresetPoint = (preset: RoadRoutePreset, progress: number) => {
	const segmentCount = preset.points.length - 1;
	const scaledProgress = progress * segmentCount;
	const segmentIndex = Math.min(Math.floor(scaledProgress), segmentCount - 1);
	const segmentProgress = scaledProgress - segmentIndex;
	const from = preset.points[segmentIndex];
	const to = preset.points[segmentIndex + 1];

	return {
		lat: from.lat + (to.lat - from.lat) * segmentProgress,
		lng: from.lng + (to.lng - from.lng) * segmentProgress,
	};
};

const buildRouteFromPreset = (preset: RoadRoutePreset, numPoints: number, reverse: boolean, rng: RandomGenerator) => {
	const safePointCount = Math.max(2, numPoints);

	return Array.from({ length: safePointCount }, (_, index): RoutePoint => {
		const progress = safePointCount === 1 ? 0 : index / (safePointCount - 1);
		const point = interpolatePresetPoint(preset, reverse ? 1 - progress : progress);
		const speedVariation = rng() * simulationConfig.speedVariationRange - simulationConfig.speedVariationRange / 2;
		const speed = clamp(58 + speedVariation, simulationConfig.minSpeed, simulationConfig.maxSpeed);

		return {
			...point,
			speed,
		};
	});
};

export const generateRoutes = (
	_startPoint: RoutePoint,
	numRoutes: number,
	numPoints: number,
	options: GenerateRoutesOptions = {}
): RoutePoint[][] => {
	const rng = options.rng ?? createSeededRandom(options.seed ?? 42);

	return Array.from({ length: numRoutes }, () => {
		const preset = ROAD_ROUTE_PRESETS[Math.floor(rng() * ROAD_ROUTE_PRESETS.length)];
		const reverse = rng() >= 0.5;

		return buildRouteFromPreset(preset, numPoints, reverse, rng);
	});
};

type CreateFleetSimulationOptions = {
	seed: number;
	scenarioId: ScenarioId;
	numRoutes?: number;
	numPoints?: number;
};

export const defaultStartPoint: RoutePoint = {
	lat: 52.1943,
	lng: 0.1371,
	speed: 70,
};

export const createFleetSimulation = ({
	seed,
	scenarioId,
	numRoutes = simulationConfig.defaultTruckCount,
	numPoints = simulationConfig.defaultRoutePointCount,
}: CreateFleetSimulationOptions): TruckRoute[] => {
	const rng = createSeededRandom(seed);
	const scenario = scenarios[scenarioId];
	const routes = generateRoutes(defaultStartPoint, numRoutes, numPoints, { rng });
	const createdAt = new Date().toLocaleTimeString();

	return routes.map((points, index) => {
		const routeBias = rng();
		const matchingPreset =
			ROAD_ROUTE_PRESETS.find((preset) => {
				const firstPresetPoint = preset.points[0];
				const lastPresetPoint = preset.points[preset.points.length - 1];
				const firstRoutePoint = points[0];
				const lastRoutePoint = points[points.length - 1];

				return (
					(firstPresetPoint.lat === firstRoutePoint.lat &&
						firstPresetPoint.lng === firstRoutePoint.lng &&
						lastPresetPoint.lat === lastRoutePoint.lat &&
						lastPresetPoint.lng === lastRoutePoint.lng) ||
					(firstPresetPoint.lat === lastRoutePoint.lat &&
						firstPresetPoint.lng === lastRoutePoint.lng &&
						lastPresetPoint.lat === firstRoutePoint.lat &&
						lastPresetPoint.lng === firstRoutePoint.lng)
				);
			}) ?? ROAD_ROUTE_PRESETS[index % ROAD_ROUTE_PRESETS.length];
		const zoneWarnings = getRouteZoneWarnings(points, scenario.riskZones);
		const metrics = calculateRouteMetrics({
			points,
			currentPointIndex: 0,
			scenario,
			routeBias,
			zoneWarnings,
		});

		return {
			id: `route-${String(index + 1).padStart(2, "0")}`,
			truckId: `TRK-${String(index + 1).padStart(2, "0")}`,
			driverName: driverNames[index % driverNames.length],
			routePresetId: matchingPreset.id,
			routeName: matchingPreset.name,
			points,
			currentPointIndex: 0,
			zoneWarnings,
			lastUpdate: createdAt,
			...metrics,
		};
	});
};
