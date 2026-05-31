export const formatMinutes = (minutes: number): string => {
	if (minutes <= 0) {
		return "0 min";
	}

	return `${minutes} min`;
};

export const formatPercent = (value: number): string => `${Math.round(value)}%`;

export const formatSpeed = (value: number): string => `${Math.round(value)} km/h`;

export const formatDistance = (value: number): string => `${value.toFixed(1)} km`;
