import React from "react";
import cn from "classnames";
import type { ScenarioId, SpeedMultiplier } from "@domain/fleet-simulation";
import { scenarioOptions } from "@domain/fleet-simulation";
import styles from "./MapControls.module.css";

type MapControlsProps = {
	isRunning: boolean;
	speedMultiplier: SpeedMultiplier;
	scenarioId: ScenarioId;
	seed: number;
	onToggleRunning: () => void;
	onReset: () => void;
	onFitAllRoutes: () => void;
	onSpeedChange: (speed: SpeedMultiplier) => void;
	onScenarioChange: (scenarioId: ScenarioId) => void;
	onSeedChange: (seed: number) => void;
};

const MapControls: React.FC<MapControlsProps> = ({
	isRunning,
	speedMultiplier,
	scenarioId,
	seed,
	onToggleRunning,
	onReset,
	onFitAllRoutes,
	onSpeedChange,
	onScenarioChange,
	onSeedChange,
}) => {
	return (
		<div className={styles.controls} aria-label="Simulation controls">
			<div className={styles.mobileStrip}>
				<button type="button" className={styles.primary} onClick={onToggleRunning}>
					{isRunning ? "Pause" : "Resume"}
				</button>
				<span>{speedMultiplier}x</span>
				<button type="button" onClick={onFitAllRoutes}>
					Fit
				</button>
			</div>
			<details className={styles.mobileDetails}>
				<summary>More</summary>
				<div className={styles.mobilePanel}>
					<button type="button" onClick={onReset}>
						Reset
					</button>
					<div className={cn(styles.row, styles.segmented)} aria-label="Speed multiplier">
						{([1, 2, 4] as SpeedMultiplier[]).map((speed) => (
							<button
								type="button"
								key={speed}
								className={cn(speedMultiplier === speed && styles.active)}
								onClick={() => onSpeedChange(speed)}
							>
								{speed}x
							</button>
						))}
					</div>
					<label className={styles.field}>
						<span>Scenario</span>
						<select
							value={scenarioId}
							onChange={(event) => onScenarioChange(event.target.value as ScenarioId)}
						>
							{scenarioOptions.map((scenario) => (
								<option key={scenario.id} value={scenario.id}>
									{scenario.label}
								</option>
							))}
						</select>
					</label>
					<label className={styles.field}>
						<span>Seed</span>
						<input
							type="number"
							value={seed}
							onChange={(event) => onSeedChange(Number(event.target.value) || 1)}
							min={1}
							step={1}
						/>
					</label>
				</div>
			</details>
			<div className={styles.desktopPanel}>
				<div className={styles.row}>
					<button type="button" className={styles.primary} onClick={onToggleRunning}>
						{isRunning ? "Pause" : "Resume"}
					</button>
					<button type="button" onClick={onReset}>
						Reset
					</button>
					<button type="button" onClick={onFitAllRoutes}>
						Fit
					</button>
				</div>
				<div className={cn(styles.row, styles.segmented)} aria-label="Speed multiplier">
					{([1, 2, 4] as SpeedMultiplier[]).map((speed) => (
						<button
							type="button"
							key={speed}
							className={cn(speedMultiplier === speed && styles.active)}
							onClick={() => onSpeedChange(speed)}
						>
							{speed}x
						</button>
					))}
				</div>
				<label className={styles.field}>
					<span>Scenario</span>
					<select value={scenarioId} onChange={(event) => onScenarioChange(event.target.value as ScenarioId)}>
						{scenarioOptions.map((scenario) => (
							<option key={scenario.id} value={scenario.id}>
								{scenario.label}
							</option>
						))}
					</select>
				</label>
				<label className={styles.field}>
					<span>Seed</span>
					<input
						type="number"
						value={seed}
						onChange={(event) => onSeedChange(Number(event.target.value) || 1)}
						min={1}
						step={1}
					/>
				</label>
			</div>
		</div>
	);
};

export default MapControls;
