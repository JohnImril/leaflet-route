export type TruckStatus = "on-time" | "delayed" | "at-risk" | "completed";

export type RiskLevel = "low" | "medium" | "high";

export type ScenarioId = "normal" | "rush-hour" | "bad-weather" | "road-closure";

export type SpeedMultiplier = 1 | 2 | 4;

export type RoutePoint = {
	lat: number;
	lng: number;
	speed: number;
};

export type RiskZoneType = "traffic" | "weather" | "closure";

export type RiskZone = {
	id: string;
	label: string;
	type: RiskZoneType;
	center: [number, number];
	radiusMeters: number;
	riskLevel: RiskLevel;
};

export type TruckRoute = {
	id: string;
	truckId: string;
	driverName: string;
	routePresetId: string;
	routeName: string;
	status: TruckStatus;
	riskLevel: RiskLevel;
	points: RoutePoint[];
	currentPointIndex: number;
	progressPercent: number;
	etaMinutes: number;
	delayMinutes: number;
	distanceKm: number;
	currentSpeed: number;
	zoneWarnings: string[];
	lastUpdate: string;
};

export type FleetEvent = {
	id: string;
	timestamp: string;
	truckId: string;
	message: string;
	severity: RiskLevel;
};

export type FleetMetrics = {
	totalTrucks: number;
	activeRoutes: number;
	completedRoutes: number;
	delayedRoutes: number;
	atRiskRoutes: number;
	averageSpeed: number;
	fleetHealthScore: number;
};
