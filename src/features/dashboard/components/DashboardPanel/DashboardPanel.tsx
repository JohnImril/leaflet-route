import React from "react";
import cn from "classnames";
import type { FleetEvent, FleetMetrics, TruckRoute } from "@domain/fleet-simulation";
import type { ScenarioConfig } from "@domain/fleet-simulation";
import { formatSpeed } from "@shared/utils/formatters";
import ActivityFeed from "../ActivityFeed/ActivityFeed";
import MetricCard from "../MetricCard/MetricCard";
import TruckDetails from "../TruckDetails/TruckDetails";
import TruckList from "../TruckList/TruckList";
import styles from "./DashboardPanel.module.css";

type DashboardPanelProps = {
	metrics: FleetMetrics;
	routes: TruckRoute[];
	selectedTruck: TruckRoute | null;
	selectedTruckId: string | null;
	events: FleetEvent[];
	scenario: ScenarioConfig;
	isRunning: boolean;
	onSelectTruck: (truckId: string) => void;
};

const DashboardPanel: React.FC<DashboardPanelProps> = ({
	metrics,
	routes,
	selectedTruck,
	selectedTruckId,
	events,
	scenario,
	isRunning,
	onSelectTruck,
}) => {
	return (
		<aside className={styles.panel}>
			<header className={styles.header}>
				<div>
					<p>Fleet Route Monitor</p>
					<h1>Operations dashboard</h1>
				</div>
				<span className={cn(styles.simulationPill, isRunning ? styles.running : styles.paused)}>
					{isRunning ? "Running" : "Paused"}
				</span>
			</header>
			<p className={styles.scenarioSummary}>{scenario.description}</p>
			<section className={styles.metricsGrid} aria-label="Fleet metrics">
				<MetricCard label="Total trucks" value={metrics.totalTrucks} />
				<MetricCard label="Active routes" value={metrics.activeRoutes} />
				<MetricCard label="Completed" value={metrics.completedRoutes} tone="good" />
				<MetricCard
					label="Delayed"
					value={metrics.delayedRoutes}
					tone={metrics.delayedRoutes > 0 ? "warning" : "neutral"}
				/>
				<MetricCard
					label="At risk"
					value={metrics.atRiskRoutes}
					tone={metrics.atRiskRoutes > 0 ? "danger" : "neutral"}
				/>
				<MetricCard label="Avg speed" value={formatSpeed(metrics.averageSpeed)} />
				<MetricCard
					label="Fleet health"
					value={`${metrics.fleetHealthScore}%`}
					tone={metrics.fleetHealthScore > 82 ? "good" : metrics.fleetHealthScore > 65 ? "warning" : "danger"}
				/>
			</section>
			<TruckDetails truck={selectedTruck} scenario={scenario} />
			<TruckList routes={routes} selectedTruckId={selectedTruckId} onSelectTruck={onSelectTruck} />
			<ActivityFeed events={events} />
		</aside>
	);
};

export default DashboardPanel;
