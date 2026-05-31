import type { RiskLevel, RoutePoint, TruckRoute } from "@domain/fleet-simulation";

export type RouteVisualState = "on-time" | "delayed" | "at-risk" | "completed";

type RouteVisualStyle = {
	label: string;
	color: string;
	outlineColor: string;
	opacity: number;
};

export const ROUTE_VISUAL_STYLES: Record<RouteVisualState, RouteVisualStyle> = {
	"on-time": {
		label: "On-time / low risk",
		color: "#16a34a",
		outlineColor: "#14532d",
		opacity: 0.86,
	},
	delayed: {
		label: "Delayed / medium risk",
		color: "#f59e0b",
		outlineColor: "#92400e",
		opacity: 0.92,
	},
	"at-risk": {
		label: "At-risk / high risk",
		color: "#dc2626",
		outlineColor: "#7f1d1d",
		opacity: 0.96,
	},
	completed: {
		label: "Completed",
		color: "#94a3b8",
		outlineColor: "#475569",
		opacity: 0.48,
	},
};

export const SELECTED_ROUTE_STYLE = {
	label: "Selected route",
	outlineColor: "#4f46e5",
	weightBoost: 3,
	outlineBoost: 3,
};

export const HOVERED_ROUTE_STYLE = {
	label: "Hovered route",
	weightBoost: 2,
	opacity: 1,
};

export const NAVIGATION_ROUTE_STYLES = {
	shadowCasing: {
		label: "Route shadow",
		color: "#0f172a",
		weight: 12,
		opacity: 0.16,
	},
	lightCasing: {
		label: "Route casing",
		color: "#ffffff",
		weight: 10,
		opacity: 0.84,
	},
	planned: {
		label: "Planned route",
		color: "#334155",
		weight: 6,
		opacity: 0.86,
	},
	progress: {
		label: "Completed progress",
		color: "#10b981",
		innerColor: "#d1fae5",
		weight: 6,
		innerWeight: 2,
		opacity: 0.98,
	},
	completed: {
		label: "Completed route",
		color: "#94a3b8",
		weight: 5,
		opacity: 0.62,
	},
	selectedGlow: {
		label: "Selected route glow",
		color: SELECTED_ROUTE_STYLE.outlineColor,
		weight: 14,
		opacity: 0.2,
	},
	selectedOutline: {
		label: "Selected route",
		color: SELECTED_ROUTE_STYLE.outlineColor,
		weight: 10,
		opacity: 0.34,
	},
	delayedOverlay: {
		label: "Delayed warning",
		color: ROUTE_VISUAL_STYLES.delayed.color,
		weight: 3,
		opacity: 0.65,
		dashArray: "8 10",
	},
	atRiskOverlay: {
		label: "At-risk warning",
		color: "#e11d48",
		weight: 3,
		opacity: 0.7,
		dashArray: "5 8",
	},
	hover: {
		weightBoost: 1,
		opacity: 1,
	},
} as const;

export const RISK_ZONE_STYLES: Record<
	Exclude<RiskLevel, "low">,
	{ label: string; color: string; fillColor: string }
> = {
	medium: {
		label: "Medium risk zone",
		color: "#d97706",
		fillColor: "#f59e0b",
	},
	high: {
		label: "High risk zone",
		color: "#dc2626",
		fillColor: "#ef4444",
	},
};

export const MAP_LEGEND_ITEMS = [
	{ label: NAVIGATION_ROUTE_STYLES.planned.label, color: NAVIGATION_ROUTE_STYLES.planned.color },
	{ label: NAVIGATION_ROUTE_STYLES.progress.label, color: NAVIGATION_ROUTE_STYLES.progress.color },
	{
		label: NAVIGATION_ROUTE_STYLES.selectedOutline.label,
		color: NAVIGATION_ROUTE_STYLES.selectedOutline.color,
		className: "selected",
	},
	{
		label: NAVIGATION_ROUTE_STYLES.delayedOverlay.label,
		color: NAVIGATION_ROUTE_STYLES.delayedOverlay.color,
		className: "warning",
	},
	{
		label: NAVIGATION_ROUTE_STYLES.atRiskOverlay.label,
		color: NAVIGATION_ROUTE_STYLES.atRiskOverlay.color,
		className: "warning",
	},
	{
		label: RISK_ZONE_STYLES.medium.label,
		color: RISK_ZONE_STYLES.medium.color,
		fillColor: RISK_ZONE_STYLES.medium.fillColor,
		className: "zone",
	},
	{
		label: RISK_ZONE_STYLES.high.label,
		color: RISK_ZONE_STYLES.high.color,
		fillColor: RISK_ZONE_STYLES.high.fillColor,
		className: "zone",
	},
] as const;

export const getRouteVisualState = (route: Pick<TruckRoute, "status" | "riskLevel">): RouteVisualState => {
	if (route.status === "completed") {
		return "completed";
	}

	if (route.status === "at-risk" || route.riskLevel === "high") {
		return "at-risk";
	}

	if (route.status === "delayed" || route.riskLevel === "medium") {
		return "delayed";
	}

	return "on-time";
};

export const getRouteBaseColor = (route: Pick<TruckRoute, "status" | "riskLevel">): string => {
	void route;

	return NAVIGATION_ROUTE_STYLES.planned.color;
};

export const getRouteMarkerStyle = (route: Pick<TruckRoute, "status" | "riskLevel">) => {
	const visualStyle = ROUTE_VISUAL_STYLES[getRouteVisualState(route)];

	return {
		color: visualStyle.color,
		outlineColor: visualStyle.outlineColor,
	};
};

export const getRouteLineStyle = ({
	route,
	isSelected,
	isHovered,
}: {
	route: Pick<TruckRoute, "status" | "riskLevel">;
	isSelected: boolean;
	isHovered: boolean;
}) => {
	const routeIsCompleted = route.status === "completed";
	const plannedStyle = routeIsCompleted ? NAVIGATION_ROUTE_STYLES.completed : NAVIGATION_ROUTE_STYLES.planned;
	const plannedWeight = plannedStyle.weight + (isHovered ? NAVIGATION_ROUTE_STYLES.hover.weightBoost : 0);
	const progressWeight =
		NAVIGATION_ROUTE_STYLES.progress.weight + (isHovered ? NAVIGATION_ROUTE_STYLES.hover.weightBoost : 0);

	return {
		shadowCasing: {
			color: NAVIGATION_ROUTE_STYLES.shadowCasing.color,
			weight: NAVIGATION_ROUTE_STYLES.shadowCasing.weight + (isHovered ? 1 : 0),
			opacity: isHovered
				? NAVIGATION_ROUTE_STYLES.shadowCasing.opacity + 0.04
				: NAVIGATION_ROUTE_STYLES.shadowCasing.opacity,
		},
		lightCasing: {
			color: NAVIGATION_ROUTE_STYLES.lightCasing.color,
			weight: NAVIGATION_ROUTE_STYLES.lightCasing.weight + (isHovered ? 1 : 0),
			opacity: NAVIGATION_ROUTE_STYLES.lightCasing.opacity,
		},
		planned: {
			color: plannedStyle.color,
			weight: plannedWeight,
			opacity: isHovered ? NAVIGATION_ROUTE_STYLES.hover.opacity : plannedStyle.opacity,
		},
		progress: {
			color: routeIsCompleted ? NAVIGATION_ROUTE_STYLES.completed.color : NAVIGATION_ROUTE_STYLES.progress.color,
			weight: progressWeight,
			opacity: routeIsCompleted
				? NAVIGATION_ROUTE_STYLES.completed.opacity
				: NAVIGATION_ROUTE_STYLES.progress.opacity,
			innerColor: NAVIGATION_ROUTE_STYLES.progress.innerColor,
			innerWeight: NAVIGATION_ROUTE_STYLES.progress.innerWeight,
		},
		selectedGlow: {
			color: NAVIGATION_ROUTE_STYLES.selectedGlow.color,
			weight: NAVIGATION_ROUTE_STYLES.selectedGlow.weight + (isHovered ? 1 : 0),
			opacity: isSelected ? NAVIGATION_ROUTE_STYLES.selectedGlow.opacity : 0,
		},
		selectedOutline: {
			color: NAVIGATION_ROUTE_STYLES.selectedOutline.color,
			weight: NAVIGATION_ROUTE_STYLES.selectedOutline.weight + (isHovered ? 1 : 0),
			opacity: isSelected ? NAVIGATION_ROUTE_STYLES.selectedOutline.opacity : 0,
		},
		warningOverlay:
			route.status === "at-risk" || route.riskLevel === "high"
				? NAVIGATION_ROUTE_STYLES.atRiskOverlay
				: route.status === "delayed" || route.riskLevel === "medium"
					? NAVIGATION_ROUTE_STYLES.delayedOverlay
					: null,
	};
};

export const getRouteProgressPoints = (
	route: Pick<TruckRoute, "points" | "currentPointIndex">
): {
	completedPoints: RoutePoint[];
	remainingPoints: RoutePoint[];
} => {
	const safeIndex = Math.min(Math.max(route.currentPointIndex, 0), Math.max(route.points.length - 1, 0));

	return {
		completedPoints: route.points.slice(0, safeIndex + 1),
		remainingPoints: route.points.slice(safeIndex),
	};
};
