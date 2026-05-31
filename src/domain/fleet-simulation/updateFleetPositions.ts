import type { FleetEvent, SpeedMultiplier, TruckRoute } from "@domain/fleet-simulation";
import { calculateRouteMetrics, getRouteZoneWarnings } from "./calculateRouteMetrics";
import type { ScenarioConfig } from "./scenarios";

type UpdateFleetPositionsInput = {
	routes: TruckRoute[];
	scenario: ScenarioConfig;
	speedMultiplier: SpeedMultiplier;
	tick: number;
};

type UpdateFleetPositionsOutput = {
	routes: TruckRoute[];
	events: FleetEvent[];
};

const createEvent = (truckId: string, message: string, severity: FleetEvent["severity"], tick: number): FleetEvent => ({
	id: `${truckId}-${tick}-${message.replace(/\W+/g, "-")}`,
	timestamp: new Date().toLocaleTimeString(),
	truckId,
	message,
	severity,
});

export const updateFleetPositions = ({
	routes,
	scenario,
	speedMultiplier,
	tick,
}: UpdateFleetPositionsInput): UpdateFleetPositionsOutput => {
	const events: FleetEvent[] = [];
	const updatedRoutes = routes.map((route, index) => {
		const previousStatus = route.status;
		const previousRisk = route.riskLevel;
		const previousEta = route.etaMinutes;
		const nextIndex = Math.min(route.currentPointIndex + speedMultiplier, route.points.length - 1);
		const zoneWarnings = getRouteZoneWarnings(route.points.slice(0, nextIndex + 1), scenario.riskZones);
		const routeBias = ((index * 17 + tick * 7) % 100) / 100;
		const metrics = calculateRouteMetrics({
			points: route.points,
			currentPointIndex: nextIndex,
			scenario,
			routeBias,
			zoneWarnings,
		});

		if (metrics.status === "completed" && previousStatus !== "completed") {
			events.push(createEvent(route.truckId, `${route.truckId} completed route`, "low", tick));
		}

		if (metrics.riskLevel === "high" && previousRisk !== "high") {
			events.push(createEvent(route.truckId, `${route.truckId} entered high-risk conditions`, "high", tick));
		}

		if (metrics.status === "delayed" && previousStatus !== "delayed") {
			events.push(createEvent(route.truckId, `${route.truckId} delay risk increased`, "medium", tick));
		}

		if (Math.abs(metrics.etaMinutes - previousEta) >= 6 && metrics.status !== "completed") {
			events.push(
				createEvent(route.truckId, `${route.truckId} ETA changed to ${metrics.etaMinutes} min`, "low", tick)
			);
		}

		if (zoneWarnings.length > route.zoneWarnings.length) {
			events.push(createEvent(route.truckId, `${route.truckId} entered ${zoneWarnings.at(-1)}`, "medium", tick));
		}

		return {
			...route,
			...metrics,
			currentPointIndex: nextIndex,
			zoneWarnings,
			lastUpdate: new Date().toLocaleTimeString(),
		};
	});

	return {
		routes: updatedRoutes,
		events,
	};
};
