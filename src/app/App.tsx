import React, { useState } from "react";
import { DashboardPanel } from "@features/dashboard";
import { FleetMap, useFleetSimulation, type ScenarioId, type SpeedMultiplier } from "@features/fleet-map";
import styles from "./App.module.css";

const App: React.FC = () => {
	const simulation = useFleetSimulation();
	const [fitRequest, setFitRequest] = useState(1);

	const handleToggleRunning = () => {
		simulation.setIsRunning(!simulation.isRunning);
	};

	const handleReset = () => {
		simulation.resetSimulation();
		setFitRequest((value) => value + 1);
	};

	const handleScenarioChange = (scenarioId: ScenarioId) => {
		simulation.changeScenario(scenarioId);
		setFitRequest((value) => value + 1);
	};

	const handleSeedChange = (seed: number) => {
		simulation.changeSeed(seed);
		setFitRequest((value) => value + 1);
	};

	const handleSpeedChange = (speed: SpeedMultiplier) => {
		simulation.setSpeedMultiplier(speed);
	};

	return (
		<div className={styles.appShell}>
			<DashboardPanel
				metrics={simulation.metrics}
				routes={simulation.routes}
				selectedTruck={simulation.selectedTruck}
				selectedTruckId={simulation.selectedTruckId}
				events={simulation.events}
				scenario={simulation.scenario}
				isRunning={simulation.isRunning}
				onSelectTruck={simulation.setSelectedTruckId}
			/>
			<FleetMap
				routes={simulation.routes}
				selectedTruck={simulation.selectedTruck}
				selectedTruckId={simulation.selectedTruckId}
				scenario={simulation.scenario}
				scenarioId={simulation.scenarioId}
				seed={simulation.seed}
				isRunning={simulation.isRunning}
				speedMultiplier={simulation.speedMultiplier}
				fitRequest={fitRequest}
				onSelectTruck={simulation.setSelectedTruckId}
				onToggleRunning={handleToggleRunning}
				onReset={handleReset}
				onFitAllRoutes={() => setFitRequest((value) => value + 1)}
				onSpeedChange={handleSpeedChange}
				onScenarioChange={handleScenarioChange}
				onSeedChange={handleSeedChange}
			/>
		</div>
	);
};

export default App;
