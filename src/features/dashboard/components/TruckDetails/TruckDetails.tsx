import React from "react";
import cn from "classnames";
import type { ScenarioConfig } from "@domain/fleet-simulation";
import type { RiskLevel, TruckRoute, TruckStatus } from "@domain/fleet-simulation";
import { formatDistance, formatMinutes, formatPercent, formatSpeed } from "@shared/utils/formatters";
import styles from "./TruckDetails.module.css";

type TruckDetailsProps = {
	truck: TruckRoute | null;
	scenario: ScenarioConfig;
};

const statusClassName: Record<TruckStatus, string> = {
	"on-time": styles.onTime,
	delayed: styles.delayed,
	"at-risk": styles.atRisk,
	completed: styles.completed,
};

const riskClassName: Record<RiskLevel, string> = {
	low: styles.low,
	medium: styles.medium,
	high: styles.high,
};

const TruckDetails: React.FC<TruckDetailsProps> = ({ truck, scenario }) => {
	if (!truck) {
		return (
			<section className={cn(styles.section, styles.emptyState)}>
				<h2>Route details</h2>
				<p>Select a truck to inspect route details.</p>
			</section>
		);
	}

	return (
		<section className={styles.section}>
			<div className={styles.heading}>
				<h2>{truck.truckId}</h2>
				<span>{truck.driverName}</span>
			</div>
			<div className={styles.detailGrid}>
				<span>Status</span>
				<strong className={cn(styles.statusText, statusClassName[truck.status])}>{truck.status}</strong>
				<span>Risk level</span>
				<strong className={cn(styles.riskText, riskClassName[truck.riskLevel])}>{truck.riskLevel}</strong>
				<span>Route</span>
				<strong>{truck.routeName}</strong>
				<span>Current speed</span>
				<strong>{formatSpeed(truck.currentSpeed)}</strong>
				<span>Progress</span>
				<strong>{formatPercent(truck.progressPercent)}</strong>
				<span>ETA</span>
				<strong>{formatMinutes(truck.etaMinutes)}</strong>
				<span>Delay</span>
				<strong>{formatMinutes(truck.delayMinutes)}</strong>
				<span>Distance</span>
				<strong>{formatDistance(truck.distanceKm)}</strong>
				<span>Scenario</span>
				<strong>{scenario.label}</strong>
				<span>Last update</span>
				<strong>{truck.lastUpdate}</strong>
			</div>
			{truck.zoneWarnings.length > 0 && (
				<div className={styles.warningBox}>
					<strong>Risk zone warning</strong>
					<span>{truck.zoneWarnings.join(", ")}</span>
				</div>
			)}
		</section>
	);
};

export default TruckDetails;
