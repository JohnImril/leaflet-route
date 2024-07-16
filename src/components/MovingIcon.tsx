import React from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

import truckIconSrc from "../images/truck.svg";

const truckIcon = new L.Icon({
	iconUrl: truckIconSrc,
	iconSize: [38, 38],
	iconAnchor: [19, 38],
	popupAnchor: [0, -40],
});

interface MovingIconProps {
	position: [number, number];
	index: number;
}

const MovingIcon: React.FC<MovingIconProps> = React.memo(
	({ position, index }) => {
		return (
			<Marker position={position} icon={truckIcon}>
				<Tooltip direction="top" offset={[0, -20]}>
					{"Truck #" + (index + 1)}
				</Tooltip>
			</Marker>
		);
	}
);

export default MovingIcon;
