import type { RiskZone, ScenarioId } from "@domain/fleet-simulation";

export type ScenarioConfig = {
	id: ScenarioId;
	label: string;
	speedFactor: number;
	delayFactor: number;
	riskBias: number;
	description: string;
	riskZones: RiskZone[];
};

const baseRiskZones: RiskZone[] = [
	{
		id: "traffic-city-centre",
		label: "City centre traffic",
		type: "traffic",
		center: [52.2054, 0.1218],
		radiusMeters: 640,
		riskLevel: "medium",
	},
	{
		id: "weather-south-cambridge",
		label: "South Cambridge weather",
		type: "weather",
		center: [52.1812, 0.146],
		radiusMeters: 780,
		riskLevel: "medium",
	},
	{
		id: "closure-newmarket-road",
		label: "Newmarket Road closure",
		type: "closure",
		center: [52.213, 0.171],
		radiusMeters: 520,
		riskLevel: "high",
	},
];

export const scenarios: Record<ScenarioId, ScenarioConfig> = {
	normal: {
		id: "normal",
		label: "Normal day",
		speedFactor: 1,
		delayFactor: 0.45,
		riskBias: 0.08,
		description: "Regular traffic and stable dispatch conditions.",
		riskZones: [baseRiskZones[0]],
	},
	"rush-hour": {
		id: "rush-hour",
		label: "Rush hour",
		speedFactor: 0.72,
		delayFactor: 1.25,
		riskBias: 0.24,
		description: "Lower average speeds with more late arrivals.",
		riskZones: [baseRiskZones[0], baseRiskZones[2]],
	},
	"bad-weather": {
		id: "bad-weather",
		label: "Bad weather",
		speedFactor: 0.62,
		delayFactor: 1.55,
		riskBias: 0.34,
		description: "Weather exposure increases risk across the fleet.",
		riskZones: [baseRiskZones[0], baseRiskZones[1]],
	},
	"road-closure": {
		id: "road-closure",
		label: "Road closure",
		speedFactor: 0.78,
		delayFactor: 1.8,
		riskBias: 0.42,
		description: "Closure pressure pushes selected routes into high risk.",
		riskZones: baseRiskZones,
	},
};

export const scenarioOptions = Object.values(scenarios);
