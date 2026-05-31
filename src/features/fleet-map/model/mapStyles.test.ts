import { describe, expect, it } from "vitest";
import {
	getRouteBaseColor,
	getRouteLineStyle,
	getRouteMarkerStyle,
	getRouteProgressPoints,
	getRouteVisualState,
	MAP_LEGEND_ITEMS,
	NAVIGATION_ROUTE_STYLES,
	RISK_ZONE_STYLES,
	ROUTE_VISUAL_STYLES,
	SELECTED_ROUTE_STYLE,
} from "./mapStyles";
import type { RiskLevel, RoutePoint, TruckStatus } from "@domain/fleet-simulation";

const createRouteState = (status: TruckStatus, riskLevel: RiskLevel) => ({ status, riskLevel });

const routeMatrix: Array<{ status: TruckStatus; riskLevel: RiskLevel; visualState: TruckStatus }> = [
	{ status: "on-time", riskLevel: "low", visualState: "on-time" },
	{ status: "delayed", riskLevel: "medium", visualState: "delayed" },
	{ status: "at-risk", riskLevel: "high", visualState: "at-risk" },
	{ status: "completed", riskLevel: "low", visualState: "completed" },
];

describe("mapStyles", () => {
	it("defines route colors for every operational status", () => {
		const statuses: TruckStatus[] = ["on-time", "delayed", "at-risk", "completed"];

		for (const status of statuses) {
			expect(ROUTE_VISUAL_STYLES[status]).toBeDefined();
			expect(ROUTE_VISUAL_STYLES[status].color).toMatch(/^#[0-9a-f]{6}$/i);
		}

		expect(SELECTED_ROUTE_STYLE.outlineColor).toMatch(/^#[0-9a-f]{6}$/i);
	});

	it("maps route status and risk to clear visual states", () => {
		expect(getRouteVisualState({ status: "on-time", riskLevel: "low" })).toBe("on-time");
		expect(getRouteVisualState({ status: "on-time", riskLevel: "medium" })).toBe("delayed");
		expect(getRouteVisualState({ status: "delayed", riskLevel: "low" })).toBe("delayed");
		expect(getRouteVisualState({ status: "on-time", riskLevel: "high" })).toBe("at-risk");
		expect(getRouteVisualState({ status: "at-risk", riskLevel: "medium" })).toBe("at-risk");
		expect(getRouteVisualState({ status: "completed", riskLevel: "high" })).toBe("completed");
	});

	it("keeps planned route color independent of active status and risk", () => {
		const onTimeRoute = createRouteState("on-time", "low");
		const delayedRoute = createRouteState("delayed", "medium");
		const atRiskRoute = createRouteState("at-risk", "high");

		expect(getRouteBaseColor(onTimeRoute)).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
		expect(getRouteBaseColor(delayedRoute)).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
		expect(getRouteBaseColor(atRiskRoute)).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
		expect(getRouteLineStyle({ route: onTimeRoute, isSelected: false, isHovered: false }).planned.color).toBe(
			NAVIGATION_ROUTE_STYLES.planned.color
		);
		expect(getRouteLineStyle({ route: delayedRoute, isSelected: false, isHovered: false }).planned.color).toBe(
			NAVIGATION_ROUTE_STYLES.planned.color
		);
		expect(getRouteLineStyle({ route: atRiskRoute, isSelected: false, isHovered: false }).planned.color).toBe(
			NAVIGATION_ROUTE_STYLES.planned.color
		);
	});

	it.each(routeMatrix)(
		"keeps $visualState navigation route color stable across normal, hover, selected and selected hover",
		({ status, riskLevel, visualState }) => {
			const route = createRouteState(status, riskLevel);
			const routeIsCompleted = visualState === "completed";
			const baseColor = routeIsCompleted
				? NAVIGATION_ROUTE_STYLES.completed.color
				: NAVIGATION_ROUTE_STYLES.planned.color;
			const normalStyle = getRouteLineStyle({ route, isSelected: false, isHovered: false });
			const hoverStyle = getRouteLineStyle({ route, isSelected: false, isHovered: true });
			const selectedStyle = getRouteLineStyle({ route, isSelected: true, isHovered: false });
			const selectedHoverStyle = getRouteLineStyle({ route, isSelected: true, isHovered: true });

			expect(normalStyle.planned.color).toBe(baseColor);
			expect(hoverStyle.planned.color).toBe(baseColor);
			expect(selectedStyle.planned.color).toBe(baseColor);
			expect(selectedHoverStyle.planned.color).toBe(baseColor);
			expect(selectedStyle.selectedOutline.color).toBe(SELECTED_ROUTE_STYLE.outlineColor);
			expect(selectedHoverStyle.selectedOutline.color).toBe(SELECTED_ROUTE_STYLE.outlineColor);
		}
	);

	it("does not use high-risk red for non-risk route line hover states", () => {
		const nonRiskRoutes = [
			createRouteState("on-time", "low"),
			createRouteState("delayed", "medium"),
			createRouteState("completed", "low"),
		];

		for (const route of nonRiskRoutes) {
			expect(getRouteLineStyle({ route, isSelected: false, isHovered: true }).planned.color).not.toBe(
				ROUTE_VISUAL_STYLES["at-risk"].color
			);
		}
	});

	it("keeps selected and hover emphasis separate from the main route color", () => {
		const onTimeRoute = createRouteState("on-time", "low");
		const selectedStyle = getRouteLineStyle({ route: onTimeRoute, isSelected: true, isHovered: false });
		const selectedHoverStyle = getRouteLineStyle({ route: onTimeRoute, isSelected: true, isHovered: true });

		expect(selectedStyle.planned.color).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
		expect(selectedHoverStyle.planned.color).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
		expect(selectedStyle.selectedOutline.color).toBe(SELECTED_ROUTE_STYLE.outlineColor);
		expect(selectedHoverStyle.selectedOutline.color).toBe(SELECTED_ROUTE_STYLE.outlineColor);
		expect(selectedHoverStyle.planned.color).not.toBe(ROUTE_VISUAL_STYLES["at-risk"].color);
	});

	it("resets mouseout style back to the non-hover base style", () => {
		const delayedRoute = createRouteState("delayed", "medium");

		expect(getRouteLineStyle({ route: delayedRoute, isSelected: false, isHovered: false })).toEqual(
			getRouteLineStyle({ route: delayedRoute, isSelected: false, isHovered: false })
		);
		expect(getRouteLineStyle({ route: delayedRoute, isSelected: true, isHovered: false })).toEqual(
			getRouteLineStyle({ route: delayedRoute, isSelected: true, isHovered: false })
		);
	});

	it("defines matching map and legend colors for risk zones", () => {
		expect(RISK_ZONE_STYLES.medium.color).toBe("#d97706");
		expect(RISK_ZONE_STYLES.medium.fillColor).toBe("#f59e0b");
		expect(RISK_ZONE_STYLES.high.color).toBe("#dc2626");
		expect(RISK_ZONE_STYLES.high.fillColor).toBe("#ef4444");
	});

	it("keeps route line, marker and legend colors in sync", () => {
		for (const { status, riskLevel, visualState } of routeMatrix) {
			const route = createRouteState(status, riskLevel);
			const visualStyle = ROUTE_VISUAL_STYLES[visualState];

			expect(getRouteBaseColor(route)).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
			expect(getRouteMarkerStyle(route)).toEqual({
				color: visualStyle.color,
				outlineColor: visualStyle.outlineColor,
			});
		}
	});

	it("uses legend items that match navigation route and marker/status colors", () => {
		expect(MAP_LEGEND_ITEMS).toContainEqual({
			label: NAVIGATION_ROUTE_STYLES.planned.label,
			color: NAVIGATION_ROUTE_STYLES.planned.color,
		});
		expect(MAP_LEGEND_ITEMS).toContainEqual({
			label: NAVIGATION_ROUTE_STYLES.progress.label,
			color: NAVIGATION_ROUTE_STYLES.progress.color,
		});
		expect(MAP_LEGEND_ITEMS).toContainEqual({
			label: NAVIGATION_ROUTE_STYLES.selectedOutline.label,
			color: NAVIGATION_ROUTE_STYLES.selectedOutline.color,
			className: "selected",
		});
		expect(MAP_LEGEND_ITEMS).toContainEqual({
			label: NAVIGATION_ROUTE_STYLES.delayedOverlay.label,
			color: NAVIGATION_ROUTE_STYLES.delayedOverlay.color,
			className: "warning",
		});
		expect(MAP_LEGEND_ITEMS).toContainEqual({
			label: NAVIGATION_ROUTE_STYLES.atRiskOverlay.label,
			color: NAVIGATION_ROUTE_STYLES.atRiskOverlay.color,
			className: "warning",
		});
	});

	it("uses premium logistics route colors instead of blue/cyan route colors", () => {
		expect(NAVIGATION_ROUTE_STYLES.planned.color).toBe("#334155");
		expect(NAVIGATION_ROUTE_STYLES.progress.color).toBe("#10b981");
		expect(NAVIGATION_ROUTE_STYLES.progress.innerColor).toBe("#d1fae5");
		expect(NAVIGATION_ROUTE_STYLES.selectedOutline.color).toBe("#4f46e5");
		expect(NAVIGATION_ROUTE_STYLES.planned.color).not.toBe("#2563eb");
		expect(NAVIGATION_ROUTE_STYLES.progress.color).not.toBe("#22d3ee");
	});

	it("uses dashed warning overlays without replacing planned route color", () => {
		const delayedRoute = createRouteState("delayed", "medium");
		const atRiskRoute = createRouteState("at-risk", "high");

		const delayedStyle = getRouteLineStyle({ route: delayedRoute, isSelected: false, isHovered: false });
		const atRiskStyle = getRouteLineStyle({ route: atRiskRoute, isSelected: false, isHovered: false });

		expect(delayedStyle.planned.color).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
		expect(delayedStyle.warningOverlay).toMatchObject(NAVIGATION_ROUTE_STYLES.delayedOverlay);
		expect(atRiskStyle.planned.color).toBe(NAVIGATION_ROUTE_STYLES.planned.color);
		expect(atRiskStyle.warningOverlay).toMatchObject(NAVIGATION_ROUTE_STYLES.atRiskOverlay);
	});

	it("calculates route progress points from the current point index", () => {
		const points: RoutePoint[] = [
			{ lat: 52, lng: 0.1, speed: 50 },
			{ lat: 52.1, lng: 0.2, speed: 50 },
			{ lat: 52.2, lng: 0.3, speed: 50 },
			{ lat: 52.3, lng: 0.4, speed: 50 },
		];

		expect(getRouteProgressPoints({ points, currentPointIndex: 2 })).toEqual({
			completedPoints: points.slice(0, 3),
			remainingPoints: points.slice(2),
		});
		expect(getRouteProgressPoints({ points, currentPointIndex: points.length - 1 })).toEqual({
			completedPoints: points,
			remainingPoints: points.slice(points.length - 1),
		});
	});

	it("keeps risk zone legend items sourced from risk zone styles", () => {
		expect(MAP_LEGEND_ITEMS).toContainEqual({
			label: RISK_ZONE_STYLES.medium.label,
			color: RISK_ZONE_STYLES.medium.color,
			fillColor: RISK_ZONE_STYLES.medium.fillColor,
			className: "zone",
		});
		expect(MAP_LEGEND_ITEMS).toContainEqual({
			label: RISK_ZONE_STYLES.high.label,
			color: RISK_ZONE_STYLES.high.color,
			fillColor: RISK_ZONE_STYLES.high.fillColor,
			className: "zone",
		});
	});
});
