import React from "react";
import cn from "classnames";
import styles from "./MetricCard.module.css";

type MetricCardProps = {
	label: string;
	value: string | number;
	tone?: "neutral" | "good" | "warning" | "danger";
};

const toneClassName: Record<NonNullable<MetricCardProps["tone"]>, string> = {
	neutral: "",
	good: styles.good,
	warning: styles.warning,
	danger: styles.danger,
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, tone = "neutral" }) => {
	return (
		<div className={cn(styles.card, toneClassName[tone])}>
			<span>{label}</span>
			<strong>{value}</strong>
		</div>
	);
};

export default MetricCard;
