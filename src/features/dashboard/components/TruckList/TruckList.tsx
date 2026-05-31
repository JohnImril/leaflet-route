import React from "react";
import cn from "classnames";
import type { RiskLevel, TruckRoute, TruckStatus } from "@domain/fleet-simulation";
import { formatMinutes, formatPercent } from "@shared/utils/formatters";
import styles from "./TruckList.module.css";

type TruckListProps = {
	routes: TruckRoute[];
	selectedTruckId: string | null;
	onSelectTruck: (truckId: string) => void;
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

const TruckList: React.FC<TruckListProps> = ({ routes, selectedTruckId, onSelectTruck }) => {
	return (
		<section className={styles.section}>
			<div className={styles.heading}>
				<h2>Fleet</h2>
				<span>{routes.length} trucks</span>
			</div>
			<div className={styles.list}>
				{routes.map((route) => (
					<button
						type="button"
						key={route.truckId}
						className={cn(styles.row, selectedTruckId === route.truckId && styles.selected)}
						onClick={() => onSelectTruck(route.truckId)}
					>
						<span className={styles.rowMain}>
							<strong>{route.truckId}</strong>
							<span className={cn(styles.statusBadge, statusClassName[route.status])}>{route.status}</span>
						</span>
						<span className={styles.rowMeta}>
							<span>{formatPercent(route.progressPercent)}</span>
							<span>ETA {formatMinutes(route.etaMinutes)}</span>
							<span className={cn(styles.riskText, riskClassName[route.riskLevel])}>
								{route.riskLevel}
							</span>
						</span>
						<span className={styles.progressTrack}>
							<span style={{ width: `${route.progressPercent}%` }} />
						</span>
					</button>
				))}
			</div>
		</section>
	);
};

export default TruckList;
