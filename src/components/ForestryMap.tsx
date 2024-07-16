import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Hotline, HotlineOptions, Palette } from "react-leaflet-hotline";
import { LeafletEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

import { generateRoutes } from "../utils";
import MovingIcon from "./MovingIcon";

interface Coordinate {
	lat: number;
	lng: number;
	speed: number;
}

const MapComponent: React.FC = () => {
	const startPoint: Coordinate = useMemo(
		() => ({
			lat: 52.085599516387674,
			lng: 0.19872421216228986,
			speed: 70,
		}),
		[]
	);

	const routes = useMemo(
		() => generateRoutes(startPoint, 20, 50),
		[startPoint]
	);

	const [positions, setPositions] = useState<Coordinate[]>(
		routes.map((route) => route[0])
	);
	const [indices, setIndices] = useState<number[]>(routes.map(() => 1));

	useEffect(() => {
		const interval = setInterval(() => {
			setPositions((prevPositions) =>
				prevPositions.map((pos, i) => {
					const route = routes[i];
					const index = indices[i];
					if (index < route.length) {
						setIndices((prevIndices) => {
							const newIndices = [...prevIndices];
							newIndices[i] = index + 1;
							return newIndices;
						});
						return route[index];
					}
					return pos;
				})
			);
		}, 1000);

		return () => clearInterval(interval);
	}, [indices, routes]);

	const eventHandlers = useMemo(
		() => ({
			mouseover: (
				_e: LeafletEvent,
				_i: number,
				polyline: L.Polyline<any, any>
			) => polyline.setStyle({ opacity: 0.5 }),
			mouseout: (
				_e: LeafletEvent,
				_i: number,
				polyline: L.Polyline<any, any>
			) => polyline.setStyle({ opacity: 0 }),
		}),
		[]
	);

	const markers = useMemo(
		() =>
			positions.map((position, i) => (
				<MovingIcon
					key={i}
					position={[position.lat, position.lng]}
					index={i}
				/>
			)),
		[positions]
	);

	return (
		<MapContainer
			center={[startPoint.lat, startPoint.lng]}
			zoom={15}
			style={{ height: "100vh", width: "100%" }}
		>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>
			{routes.map((route, i) => (
				<Hotline
					key={i}
					data={route.slice(0, indices[i])}
					getLat={(coord) => coord.lat}
					getLng={(coord) => coord.lng}
					getVal={(coord) => coord.speed}
					options={hotlineOptions}
					eventHandlers={eventHandlers}
				/>
			))}
			{markers}
		</MapContainer>
	);
};

export default MapComponent;

const defaultPalette: Palette = [
	{ r: 255, g: 0, b: 0, t: 0 },
	{ r: 255, g: 255, b: 0, t: 0.5 },
	{ r: 0, g: 255, b: 0, t: 1 },
];

const hotlineOptions: HotlineOptions = {
	min: 0,
	max: 100,
	palette: defaultPalette,
	weight: 5,
	outlineWidth: 2,
	outlineColor: "black",
};
