import React, { useEffect, useRef } from "react";
import L, { type Marker as LeafletMarker } from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { TruckRoute } from "@domain/fleet-simulation";
import { getRouteMarkerStyle } from "@features/fleet-map/model";
import { formatMinutes, formatPercent, formatSpeed } from "@shared/utils/formatters";
import styles from "./TruckMarker.module.css";

const calculateBearing = (route: TruckRoute): number => {
	const currentPoint = route.points[route.currentPointIndex];
	const nextPoint = route.points[Math.min(route.currentPointIndex + 1, route.points.length - 1)];

	if (!currentPoint || !nextPoint) {
		return 0;
	}

	return (Math.atan2(nextPoint.lng - currentPoint.lng, nextPoint.lat - currentPoint.lat) * 180) / Math.PI;
};

const createTruckIcon = (route: TruckRoute, isSelected: boolean) => {
	const markerStyle = getRouteMarkerStyle(route);
	const bearing = calculateBearing(route);

	return L.divIcon({
		className: styles.divIcon,
		iconSize: [38, 38],
		iconAnchor: [19, 19],
		popupAnchor: [0, -18],
		html: `
			<div class="${styles.shell} ${isSelected ? styles.selected : ""}" style="--truck-color: ${markerStyle.color}; --truck-stroke: ${markerStyle.outlineColor}">
				<span class="${styles.ring}"></span>
				<span class="${styles.direction}" style="transform: rotate(${bearing}deg)"></span>
				<span class="${styles.body}">
					<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
						<path d="M5.5 8.5h11.2v8.8H5.5z" />
						<path d="M16.7 11h3.9l2.2 3.3v3h-6.1z" />
						<path d="M7.6 19.1a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11.8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
						<path d="M8 10.7h5.6M18.7 12.6h1.2l.9 1.4h-2.1z" />
					</svg>
				</span>
			</div>
		`,
	});
};

type TruckMarkerProps = {
	route: TruckRoute;
	isSelected: boolean;
	onSelect: (truckId: string) => void;
};

const TruckMarker: React.FC<TruckMarkerProps> = ({ route, isSelected, onSelect }) => {
	const markerRef = useRef<LeafletMarker | null>(null);
	const position = route.points[route.currentPointIndex];
	const icon = createTruckIcon(route, isSelected);

	useEffect(() => {
		if (isSelected) {
			markerRef.current?.openPopup();
		}
	}, [isSelected]);

	return (
		<Marker
			ref={markerRef}
			position={[position.lat, position.lng]}
			icon={icon}
			eventHandlers={{ click: () => onSelect(route.truckId) }}
		>
			<Tooltip direction="top" offset={[0, -18]} permanent={isSelected}>
				{route.truckId}
			</Tooltip>
			<Popup>
				<div className={styles.popup}>
					<strong>{route.truckId}</strong>
					<span>{route.driverName}</span>
					<span>{route.routeName}</span>
					<span>{formatPercent(route.progressPercent)} complete</span>
					<span>ETA {formatMinutes(route.etaMinutes)}</span>
					<span>{formatSpeed(route.currentSpeed)}</span>
				</div>
			</Popup>
		</Marker>
	);
};

export default React.memo(TruckMarker);
