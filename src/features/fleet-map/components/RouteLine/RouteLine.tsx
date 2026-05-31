import React, { useMemo } from "react";
import { Polyline } from "react-leaflet";
import { getRouteLineStyle, getRouteProgressPoints } from "@features/fleet-map/model";
import type { TruckRoute } from "@domain/fleet-simulation";

type RouteLineProps = {
	route: TruckRoute;
	isSelected: boolean;
	isHovered: boolean;
	hoverKey: string;
	onSelect: (truckId: string) => void;
	onHoverChange: (hoverKey: string | null) => void;
};

const RouteLine: React.FC<RouteLineProps> = ({ route, isSelected, isHovered, hoverKey, onSelect, onHoverChange }) => {
	const routePositions = useMemo(
		() => route.points.map((point) => [point.lat, point.lng] as [number, number]),
		[route.points]
	);
	const { completedPoints } = useMemo(() => getRouteProgressPoints(route), [route]);
	const { remainingPoints } = useMemo(() => getRouteProgressPoints(route), [route]);
	const progressPositions = useMemo(
		() => completedPoints.map((point) => [point.lat, point.lng] as [number, number]),
		[completedPoints]
	);
	const remainingPositions = useMemo(
		() => remainingPoints.map((point) => [point.lat, point.lng] as [number, number]),
		[remainingPoints]
	);
	const routeStyle = useMemo(
		() => getRouteLineStyle({ route, isSelected, isHovered }),
		[isHovered, isSelected, route]
	);

	const eventHandlers = useMemo(
		() => ({
			click: () => onSelect(route.truckId),
			mouseover: () => onHoverChange(hoverKey),
			mouseout: () => onHoverChange(null),
		}),
		[hoverKey, onHoverChange, onSelect, route.truckId]
	);

	return (
		<>
			{isSelected && (
				<Polyline
					positions={routePositions}
					pathOptions={{
						color: routeStyle.selectedGlow.color,
						weight: routeStyle.selectedGlow.weight,
						opacity: routeStyle.selectedGlow.opacity,
						lineCap: "round",
						lineJoin: "round",
					}}
					interactive={false}
				/>
			)}
			{isSelected && (
				<Polyline
					positions={routePositions}
					pathOptions={{
						color: routeStyle.selectedOutline.color,
						weight: routeStyle.selectedOutline.weight,
						opacity: routeStyle.selectedOutline.opacity,
						lineCap: "round",
						lineJoin: "round",
					}}
					interactive={false}
				/>
			)}
			<Polyline
				positions={routePositions}
				pathOptions={{
					color: routeStyle.shadowCasing.color,
					weight: routeStyle.shadowCasing.weight,
					opacity: routeStyle.shadowCasing.opacity,
					lineCap: "round",
					lineJoin: "round",
				}}
				interactive={false}
			/>
			<Polyline
				positions={routePositions}
				pathOptions={{
					color: routeStyle.lightCasing.color,
					weight: routeStyle.lightCasing.weight,
					opacity: routeStyle.lightCasing.opacity,
					lineCap: "round",
					lineJoin: "round",
				}}
				interactive={false}
			/>
			<Polyline
				positions={routePositions}
				pathOptions={{
					color: routeStyle.planned.color,
					weight: routeStyle.planned.weight,
					opacity: routeStyle.planned.opacity,
					lineCap: "round",
					lineJoin: "round",
				}}
				eventHandlers={eventHandlers}
			/>
			{progressPositions.length > 1 && route.status !== "completed" && (
				<>
					<Polyline
						positions={progressPositions}
						pathOptions={{
							color: routeStyle.progress.color,
							weight: routeStyle.progress.weight,
							opacity: routeStyle.progress.opacity,
							lineCap: "round",
							lineJoin: "round",
						}}
						eventHandlers={eventHandlers}
					/>
					<Polyline
						positions={progressPositions}
						pathOptions={{
							color: routeStyle.progress.innerColor,
							weight: routeStyle.progress.innerWeight,
							opacity: 0.72,
							lineCap: "round",
							lineJoin: "round",
						}}
						interactive={false}
					/>
				</>
			)}
			{routeStyle.warningOverlay && remainingPositions.length > 1 && (
				<Polyline
					positions={remainingPositions}
					pathOptions={{
						color: routeStyle.warningOverlay.color,
						weight: routeStyle.warningOverlay.weight,
						opacity: routeStyle.warningOverlay.opacity,
						dashArray: routeStyle.warningOverlay.dashArray,
						lineCap: "round",
						lineJoin: "round",
					}}
					eventHandlers={eventHandlers}
				/>
			)}
		</>
	);
};

export default RouteLine;
