import type { RiskLevel, RiskZone, RoutePoint, ScenarioId, TruckStatus } from "@domain/fleet-simulation";
import { simulationConfig } from "./simulationConfig";
import type { ScenarioConfig } from "./scenarios";

const earthRadiusKm = 6371;

export const calculateDistanceKm = (from: RoutePoint, to: RoutePoint): number => {
	const latDelta = ((to.lat - from.lat) * Math.PI) / 180;
	const lngDelta = ((to.lng - from.lng) * Math.PI) / 180;
	const fromLat = (from.lat * Math.PI) / 180;
	const toLat = (to.lat * Math.PI) / 180;

	const a =
		Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
		Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

	return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calculateRouteDistanceKm = (points: RoutePoint[]): number => {
	return points.reduce((total, point, index) => {
		if (index === 0) {
			return total;
		}

		return total + calculateDistanceKm(points[index - 1], point);
	}, 0);
};

export const calculateRemainingDistanceKm = (points: RoutePoint[], currentPointIndex: number): number => {
	const safeIndex = Math.min(Math.max(currentPointIndex, 0), Math.max(points.length - 1, 0));

	return points.slice(safeIndex).reduce((total, point, index, remainingPoints) => {
		if (index === 0) {
			return total;
		}

		return total + calculateDistanceKm(remainingPoints[index - 1], point);
	}, 0);
};

export const isPointInRiskZone = (point: RoutePoint, zone: RiskZone): boolean => {
	const zonePoint = { lat: zone.center[0], lng: zone.center[1], speed: point.speed };
	return calculateDistanceKm(point, zonePoint) * 1000 <= zone.radiusMeters;
};

export const getRouteZoneWarnings = (points: RoutePoint[], zones: RiskZone[]): string[] => {
	return zones.filter((zone) => points.some((point) => isPointInRiskZone(point, zone))).map((zone) => zone.label);
};

type MetricsInput = {
	points: RoutePoint[];
	currentPointIndex: number;
	scenario: ScenarioConfig;
	routeBias: number;
	zoneWarnings?: string[];
};

type MetricsOutput = {
	progressPercent: number;
	etaMinutes: number;
	delayMinutes: number;
	distanceKm: number;
	currentSpeed: number;
	status: TruckStatus;
	riskLevel: RiskLevel;
};

export const calculateRouteMetrics = ({
	points,
	currentPointIndex,
	scenario,
	routeBias,
	zoneWarnings = [],
}: MetricsInput): MetricsOutput => {
	const safeIndex = Math.min(Math.max(currentPointIndex, 0), Math.max(points.length - 1, 0));
	const progressPercent = points.length <= 1 ? 100 : Math.round((safeIndex / (points.length - 1)) * 100);
	const distanceKm = Number(calculateRouteDistanceKm(points).toFixed(1));
	const currentSpeed = Math.round((points[safeIndex]?.speed ?? 0) * scenario.speedFactor);
	const averageSpeed = Math.max(simulationConfig.minEtaSpeedKmh, currentSpeed || 1);
	const remainingDistanceKm = calculateRemainingDistanceKm(points, safeIndex);
	const etaMinutes = progressPercent >= 100 ? 0 : Math.max(1, Math.round((remainingDistanceKm / averageSpeed) * 60));

	const scenarioDelay = scenario.delayFactor * (1 + routeBias);
	const speedPenalty =
		currentSpeed < simulationConfig.lowSpeedPenaltyKmh
			? simulationConfig.lowSpeedDelayPenalty
			: currentSpeed < simulationConfig.mediumSpeedPenaltyKmh
				? simulationConfig.mediumSpeedDelayPenalty
				: 0;
	const zonePenalty = zoneWarnings.length * simulationConfig.riskZoneDelayPenalty;
	const delayMinutes =
		progressPercent >= 100
			? 0
			: Math.max(
					0,
					Math.round(
						etaMinutes * scenarioDelay * simulationConfig.delayMultiplier + speedPenalty + zonePenalty
					)
				);
	const riskScore =
		scenario.riskBias +
		routeBias * simulationConfig.routeBiasRiskWeight +
		delayMinutes / simulationConfig.delayRiskWeight +
		zoneWarnings.length * simulationConfig.riskZoneRiskWeight;

	const riskLevel: RiskLevel =
		riskScore >= simulationConfig.highRiskThreshold
			? "high"
			: riskScore >= simulationConfig.mediumRiskThreshold
				? "medium"
				: "low";
	const status: TruckStatus =
		progressPercent >= 100
			? "completed"
			: riskLevel === "high"
				? "at-risk"
				: delayMinutes >= 10
					? "delayed"
					: "on-time";

	return {
		progressPercent,
		etaMinutes,
		delayMinutes,
		distanceKm,
		currentSpeed,
		status,
		riskLevel,
	};
};

export const getScenarioLabel = (scenarioId: ScenarioId): string => {
	const labels: Record<ScenarioId, string> = {
		normal: "Normal day",
		"rush-hour": "Rush hour",
		"bad-weather": "Bad weather",
		"road-closure": "Road closure",
	};

	return labels[scenarioId];
};
