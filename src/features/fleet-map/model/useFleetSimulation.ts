import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	createFleetSimulation,
	limitActivityEvents,
	scenarios,
	simulationConfig,
	updateFleetPositions,
	type FleetEvent,
	type FleetMetrics,
	type ScenarioId,
	type SpeedMultiplier,
	type TruckRoute,
} from "@domain/fleet-simulation";

const createStartupEvent = (scenarioId: ScenarioId): FleetEvent => ({
	id: `startup-${scenarioId}`,
	timestamp: new Date().toLocaleTimeString(),
	truckId: "OPS",
	message: `Simulation started: ${scenarios[scenarioId].label}`,
	severity: "low",
});

const calculateFleetMetrics = (routes: TruckRoute[]): FleetMetrics => {
	const totalTrucks = routes.length;
	const completedRoutes = routes.filter((route) => route.status === "completed").length;
	const delayedRoutes = routes.filter((route) => route.status === "delayed").length;
	const atRiskRoutes = routes.filter((route) => route.status === "at-risk" || route.riskLevel === "high").length;
	const activeRoutes = totalTrucks - completedRoutes;
	const movingRoutes = routes.filter((route) => route.status !== "completed");
	const averageSpeed =
		movingRoutes.length === 0
			? 0
			: Math.round(movingRoutes.reduce((total, route) => total + route.currentSpeed, 0) / movingRoutes.length);
	const fleetHealthScore = Math.max(
		0,
		Math.min(
			100,
			Math.round(
				100 -
					atRiskRoutes * simulationConfig.atRiskPenalty -
					delayedRoutes * simulationConfig.delayedPenalty -
					completedRoutes * simulationConfig.completedPenalty
			)
		)
	);

	return {
		totalTrucks,
		activeRoutes,
		completedRoutes,
		delayedRoutes,
		atRiskRoutes,
		averageSpeed,
		fleetHealthScore,
	};
};

export const useFleetSimulation = () => {
	const [scenarioId, setScenarioId] = useState<ScenarioId>("normal");
	const [seed, setSeed] = useState<number>(simulationConfig.defaultSeed);
	const [speedMultiplier, setSpeedMultiplier] = useState<SpeedMultiplier>(1);
	const [isRunning, setIsRunning] = useState(true);
	const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
	const tickRef = useRef(0);
	const [routes, setRoutes] = useState<TruckRoute[]>(() =>
		createFleetSimulation({ seed: simulationConfig.defaultSeed, scenarioId: "normal" })
	);
	const [events, setEvents] = useState<FleetEvent[]>(() => [createStartupEvent("normal")]);

	const scenario = scenarios[scenarioId];

	const resetSimulation = useCallback(
		(nextScenarioId = scenarioId, nextSeed = seed) => {
			const nextRoutes = createFleetSimulation({ seed: nextSeed, scenarioId: nextScenarioId });
			setScenarioId(nextScenarioId);
			setSeed(nextSeed);
			setRoutes(nextRoutes);
			tickRef.current = 0;
			setSelectedTruckId(null);
			setEvents([createStartupEvent(nextScenarioId)]);
		},
		[scenarioId, seed]
	);

	const changeScenario = useCallback(
		(nextScenarioId: ScenarioId) => {
			resetSimulation(nextScenarioId, seed);
		},
		[resetSimulation, seed]
	);

	const changeSeed = useCallback(
		(nextSeed: number) => {
			resetSimulation(scenarioId, nextSeed);
		},
		[resetSimulation, scenarioId]
	);

	useEffect(() => {
		if (!isRunning) {
			return;
		}

		const intervalId = window.setInterval(() => {
			setRoutes((currentRoutes) => {
				const nextTick = tickRef.current + 1;
				tickRef.current = nextTick;
				const update = updateFleetPositions({
					routes: currentRoutes,
					scenario,
					speedMultiplier,
					tick: nextTick,
				});

				if (update.events.length > 0) {
					setEvents((currentEvents) => limitActivityEvents([...update.events, ...currentEvents]));
				}

				return update.routes;
			});
		}, 1000);

		return () => window.clearInterval(intervalId);
	}, [isRunning, scenario, speedMultiplier]);

	const selectedTruck = useMemo(
		() => routes.find((route) => route.truckId === selectedTruckId) ?? null,
		[routes, selectedTruckId]
	);

	const metrics = useMemo(() => calculateFleetMetrics(routes), [routes]);

	return {
		routes,
		events,
		metrics,
		scenario,
		scenarioId,
		seed,
		speedMultiplier,
		isRunning,
		selectedTruck,
		selectedTruckId,
		setIsRunning,
		setSpeedMultiplier,
		setSelectedTruckId,
		resetSimulation,
		changeScenario,
		changeSeed,
	};
};
