const generateRandomCoordinate = (
	base: Coordinate,
	angle: number
): Coordinate => {
	const distance = 0.001;
	const angleRad = (angle * Math.PI) / 180;

	const cosAngle = Math.cos(angleRad);
	const sinAngle = Math.sin(angleRad);

	const lat = base.lat + distance * cosAngle;
	const lng = base.lng + distance * sinAngle;

	const speedVariation = Math.random() * 20 - 10;
	const newSpeed = Math.max(5, Math.min(100, base.speed + speedVariation));

	return { lat, lng, speed: newSpeed };
};

export const generateRoutes = (
	startPoint: Coordinate,
	numRoutes: number,
	numPoints: number
): Coordinate[][] => {
	const routes: Coordinate[][] = [];
	const angleIncrement = 360 / numRoutes;

	for (let i = 0; i < numRoutes; i++) {
		const initialAngle = i * angleIncrement;
		let currentAngle = initialAngle;
		const route: Coordinate[] = [startPoint];

		const numPointsMinusOne = numPoints - 1;

		for (let j = 0; j < numPointsMinusOne; j++) {
			const lastPoint = route[route.length - 1];
			route.push(generateRandomCoordinate(lastPoint, currentAngle));
			currentAngle += Math.random() * 20 - 10;
		}

		routes.push(route);
	}

	return routes;
};
