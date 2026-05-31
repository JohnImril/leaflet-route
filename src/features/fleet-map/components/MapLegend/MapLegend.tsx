import React, { useEffect, useState } from "react";
import cn from "classnames";
import { MAP_LEGEND_ITEMS } from "@features/fleet-map/model";
import styles from "./MapLegend.module.css";

const legendClassName = {
	selected: styles.selected,
	warning: styles.warning,
	zone: styles.zone,
};

const MapLegend: React.FC = () => {
	const [isMobileLegendOpen, setIsMobileLegendOpen] = useState(false);
	const [isDesktopLegend, setIsDesktopLegend] = useState(() => window.innerWidth >= 768);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(min-width: 768px)");
		const updateViewportMode = () => setIsDesktopLegend(mediaQuery.matches);

		updateViewportMode();
		mediaQuery.addEventListener("change", updateViewportMode);

		return () => mediaQuery.removeEventListener("change", updateViewportMode);
	}, []);

	return (
		<details
			className={styles.legend}
			open={isDesktopLegend || isMobileLegendOpen}
			onToggle={(event) => {
				if (!isDesktopLegend) {
					setIsMobileLegendOpen(event.currentTarget.open);
				}
			}}
		>
			<summary>Legend</summary>
			<div className={styles.grid}>
				{MAP_LEGEND_ITEMS.map((item) => (
					<div className={styles.item} key={item.label}>
						<span
							className={cn(
								styles.swatch,
								"className" in item && item.className && legendClassName[item.className]
							)}
							style={
								"fillColor" in item && item.fillColor
									? { background: item.fillColor, borderColor: item.color }
									: "className" in item && item.className === "warning"
										? { color: item.color }
										: "color" in item && item.color
											? { background: item.color }
											: undefined
							}
						/>
						<span>{item.label}</span>
					</div>
				))}
			</div>
		</details>
	);
};

export default MapLegend;
