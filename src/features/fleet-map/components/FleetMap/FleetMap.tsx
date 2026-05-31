import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { Circle, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ScenarioConfig } from "@domain/fleet-simulation";
import { RISK_ZONE_STYLES } from "@features/fleet-map/model";
import type { ScenarioId, SpeedMultiplier, TruckRoute } from "@domain/fleet-simulation";
import MapControls from "../MapControls/MapControls";
import MapLegend from "../MapLegend/MapLegend";
import RouteLine from "../RouteLine/RouteLine";
import TruckMarker from "../TruckMarker/TruckMarker";
import styles from "./FleetMap.module.css";

type MapViewportControllerProps = {
	routeBounds: L.LatLngBounds | null;
	routeBoundsKey: string;
	selectedTruck: TruckRoute | null;
	selectedTruckId: string | null;
	fitRequest: number;
};

const createRouteBoundsFromPoints = (routes: Array<{ points: TruckRoute["points"] }>) =>
	L.latLngBounds(routes.flatMap((route) => route.points.map((point) => L.latLng(point.lat, point.lng))));

const MapViewportController: React.FC<MapViewportControllerProps> = ({
	routeBounds,
	routeBoundsKey,
	selectedTruck,
	selectedTruckId,
	fitRequest,
}) => {
	const map = useMap();
	const hasInitialFitRef = useRef(false);
	const lastManualFitRequestRef = useRef(fitRequest);
	const lastSelectedTruckIdRef = useRef<string | null>(null);
	const routeBoundsRef = useRef<L.LatLngBounds | null>(null);
	const selectedTruckRef = useRef<TruckRoute | null>(null);

	useEffect(() => {
		routeBoundsRef.current = routeBounds;
	}, [routeBounds]);

	useEffect(() => {
		selectedTruckRef.current = selectedTruck;
	}, [selectedTruck]);

	useEffect(() => {
		if (!routeBoundsRef.current || hasInitialFitRef.current) {
			return;
		}

		hasInitialFitRef.current = true;
		map.fitBounds(routeBoundsRef.current, { padding: [36, 36], maxZoom: 14 });
	}, [map, routeBoundsKey]);

	useEffect(() => {
		if (!routeBoundsRef.current || fitRequest === lastManualFitRequestRef.current) {
			return;
		}

		lastManualFitRequestRef.current = fitRequest;
		map.fitBounds(routeBoundsRef.current, { padding: [36, 36], maxZoom: 14 });
	}, [fitRequest, map]);

	useEffect(() => {
		if (!selectedTruckId) {
			lastSelectedTruckIdRef.current = null;
			return;
		}

		const selectedTruck = selectedTruckRef.current;

		if (!selectedTruck || selectedTruckId === lastSelectedTruckIdRef.current) {
			return;
		}

		lastSelectedTruckIdRef.current = selectedTruckId;
		const point = selectedTruck.points[selectedTruck.currentPointIndex];
		map.panTo([point.lat, point.lng], { animate: true, duration: 0.4 });
	}, [map, selectedTruckId]);

	return null;
};

type FleetMapProps = {
	routes: TruckRoute[];
	selectedTruck: TruckRoute | null;
	selectedTruckId: string | null;
	scenario: ScenarioConfig;
	scenarioId: ScenarioId;
	seed: number;
	isRunning: boolean;
	speedMultiplier: SpeedMultiplier;
	fitRequest: number;
	onSelectTruck: (truckId: string) => void;
	onToggleRunning: () => void;
	onReset: () => void;
	onFitAllRoutes: () => void;
	onSpeedChange: (speed: SpeedMultiplier) => void;
	onScenarioChange: (scenarioId: ScenarioId) => void;
	onSeedChange: (seed: number) => void;
};

const FleetMap: React.FC<FleetMapProps> = ({
	routes,
	selectedTruck,
	selectedTruckId,
	scenario,
	scenarioId,
	seed,
	isRunning,
	speedMultiplier,
	fitRequest,
	onSelectTruck,
	onToggleRunning,
	onReset,
	onFitAllRoutes,
	onSpeedChange,
	onScenarioChange,
	onSeedChange,
}) => {
	const [hoveredRouteKey, setHoveredRouteKey] = useState<string | null>(null);
	const firstPoint = routes[0]?.points[0] ?? { lat: 52.0856, lng: 0.1987 };
	const routeBoundsKey = useMemo(
		() =>
			routes
				.map((route) => {
					const first = route.points[0];
					const last = route.points[route.points.length - 1];
					return `${route.id}:${route.points.length}:${first.lat}:${first.lng}:${last.lat}:${last.lng}`;
				})
				.join("|"),
		[routes]
	);
	const routeGeometry = useMemo(() => routes.map((route) => ({ points: route.points })), [routes]);
	const routeBounds = useMemo(
		() => (routeGeometry.length > 0 ? createRouteBoundsFromPoints(routeGeometry) : null),
		[routeGeometry]
	);
	const hoverContextKey = `${scenarioId}:${seed}`;

	return (
		<section className={styles.shell} aria-label="Fleet map">
			<MapContainer center={[firstPoint.lat, firstPoint.lng]} zoom={14} className={styles.map}>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>
				<MapViewportController
					routeBounds={routeBounds}
					routeBoundsKey={routeBoundsKey}
					selectedTruck={selectedTruck}
					selectedTruckId={selectedTruckId}
					fitRequest={fitRequest}
				/>
				{scenario.riskZones.map((zone) => (
					<Circle
						key={zone.id}
						center={zone.center}
						radius={zone.radiusMeters}
						pathOptions={{
							color: RISK_ZONE_STYLES[zone.riskLevel === "high" ? "high" : "medium"].color,
							fillColor: RISK_ZONE_STYLES[zone.riskLevel === "high" ? "high" : "medium"].fillColor,
							fillOpacity: 0.12,
							opacity: 0.65,
							weight: 2,
						}}
					>
						<Popup>
							<strong>{zone.label}</strong>
							<span className={styles.popupLine}>{scenario.label}</span>
						</Popup>
					</Circle>
				))}
				{routes.map((route) => (
					<RouteLine
						key={route.id}
						route={route}
						isSelected={route.truckId === selectedTruckId}
						isHovered={`${hoverContextKey}:${route.id}` === hoveredRouteKey}
						hoverKey={`${hoverContextKey}:${route.id}`}
						onSelect={onSelectTruck}
						onHoverChange={setHoveredRouteKey}
					/>
				))}
				{routes.map((route) => (
					<TruckMarker
						key={route.truckId}
						route={route}
						isSelected={route.truckId === selectedTruckId}
						onSelect={onSelectTruck}
					/>
				))}
			</MapContainer>
			<MapControls
				isRunning={isRunning}
				speedMultiplier={speedMultiplier}
				scenarioId={scenarioId}
				seed={seed}
				onToggleRunning={onToggleRunning}
				onReset={onReset}
				onFitAllRoutes={onFitAllRoutes}
				onSpeedChange={onSpeedChange}
				onScenarioChange={onScenarioChange}
				onSeedChange={onSeedChange}
			/>
			<MapLegend />
		</section>
	);
};

export default FleetMap;
