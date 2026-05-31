import type { RoutePoint } from "@domain/fleet-simulation";

export type RoadRoutePreset = {
	id: string;
	name: string;
	points: Array<Pick<RoutePoint, "lat" | "lng">>;
};

export const ROAD_ROUTE_PRESETS: RoadRoutePreset[] = [
	{
		id: "cambridge-station-to-north",
		name: "Station to Cambridge North",
		points: [
			{ lat: 52.1943, lng: 0.1371 },
			{ lat: 52.1981, lng: 0.1377 },
			{ lat: 52.2032, lng: 0.1369 },
			{ lat: 52.2088, lng: 0.1344 },
			{ lat: 52.2147, lng: 0.1334 },
			{ lat: 52.2216, lng: 0.1352 },
			{ lat: 52.2256, lng: 0.1376 },
		],
	},
	{
		id: "trumpington-to-city",
		name: "Trumpington Road to City Centre",
		points: [
			{ lat: 52.1728, lng: 0.1126 },
			{ lat: 52.1796, lng: 0.1148 },
			{ lat: 52.1856, lng: 0.1179 },
			{ lat: 52.1914, lng: 0.1211 },
			{ lat: 52.1974, lng: 0.1217 },
			{ lat: 52.2034, lng: 0.1218 },
			{ lat: 52.2076, lng: 0.1225 },
		],
	},
	{
		id: "addenbrookes-to-station",
		name: "Addenbrooke's to Station",
		points: [
			{ lat: 52.1764, lng: 0.1402 },
			{ lat: 52.1812, lng: 0.1394 },
			{ lat: 52.1858, lng: 0.1382 },
			{ lat: 52.1908, lng: 0.1374 },
			{ lat: 52.1943, lng: 0.1371 },
			{ lat: 52.1988, lng: 0.1359 },
			{ lat: 52.2037, lng: 0.1326 },
		],
	},
	{
		id: "madingley-to-market",
		name: "Madingley Road to Market",
		points: [
			{ lat: 52.2157, lng: 0.0677 },
			{ lat: 52.2136, lng: 0.0818 },
			{ lat: 52.2119, lng: 0.0958 },
			{ lat: 52.2098, lng: 0.1088 },
			{ lat: 52.2078, lng: 0.1174 },
			{ lat: 52.2054, lng: 0.1218 },
			{ lat: 52.2031, lng: 0.1246 },
		],
	},
	{
		id: "newmarket-road-east",
		name: "Newmarket Road East",
		points: [
			{ lat: 52.2076, lng: 0.1225 },
			{ lat: 52.2092, lng: 0.1327 },
			{ lat: 52.2107, lng: 0.1455 },
			{ lat: 52.2124, lng: 0.1598 },
			{ lat: 52.2144, lng: 0.1741 },
			{ lat: 52.2167, lng: 0.1884 },
			{ lat: 52.2191, lng: 0.2021 },
		],
	},
	{
		id: "cherry-hinton-loop",
		name: "Cherry Hinton Delivery Loop",
		points: [
			{ lat: 52.1905, lng: 0.1429 },
			{ lat: 52.1882, lng: 0.1538 },
			{ lat: 52.1855, lng: 0.1658 },
			{ lat: 52.1819, lng: 0.1749 },
			{ lat: 52.1777, lng: 0.1701 },
			{ lat: 52.1764, lng: 0.1581 },
			{ lat: 52.1811, lng: 0.1482 },
			{ lat: 52.1875, lng: 0.1437 },
		],
	},
	{
		id: "histont-road-northwest",
		name: "Histon Road Northwest",
		points: [
			{ lat: 52.2078, lng: 0.1174 },
			{ lat: 52.2141, lng: 0.1131 },
			{ lat: 52.2208, lng: 0.1092 },
			{ lat: 52.2275, lng: 0.1058 },
			{ lat: 52.2344, lng: 0.1028 },
			{ lat: 52.2412, lng: 0.0991 },
		],
	},
	{
		id: "mill-road-airport",
		name: "Mill Road to Airport",
		points: [
			{ lat: 52.1993, lng: 0.1293 },
			{ lat: 52.1978, lng: 0.1401 },
			{ lat: 52.1962, lng: 0.1519 },
			{ lat: 52.1981, lng: 0.1626 },
			{ lat: 52.2018, lng: 0.1726 },
			{ lat: 52.2074, lng: 0.1814 },
			{ lat: 52.2132, lng: 0.1889 },
		],
	},
];
