import React from "react";
import cn from "classnames";
import type { FleetEvent, RiskLevel } from "@domain/fleet-simulation";
import styles from "./ActivityFeed.module.css";

type ActivityFeedProps = {
	events: FleetEvent[];
};

const severityClassName: Record<RiskLevel, string> = {
	low: "",
	medium: styles.medium,
	high: styles.high,
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
	return (
		<section className={styles.section}>
			<div className={styles.heading}>
				<h2>Activity</h2>
				<span>Latest events</span>
			</div>
			<div className={styles.feed}>
				{events.map((event) => (
					<div className={cn(styles.item, severityClassName[event.severity])} key={event.id}>
						<span>{event.timestamp}</span>
						<strong>{event.message}</strong>
					</div>
				))}
			</div>
		</section>
	);
};

export default ActivityFeed;
