import { simulationConfig } from "./simulationConfig";
import type { FleetEvent } from "./types";

export const limitActivityEvents = (events: FleetEvent[]): FleetEvent[] =>
	events.slice(0, simulationConfig.maxActivityEvents);
