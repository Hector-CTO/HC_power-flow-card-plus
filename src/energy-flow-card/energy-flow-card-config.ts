/**
 * Configuration interface for the HC Power Flow card.
 * Defines all entities, visual settings, and behavioral options.
 */
export interface HCPowerFlowConfig {
  type: string;
  title?: string;
  entities: EnergyFlowEntities;
  max_flow_kw?: number;
  show_weather?: boolean;
  show_breaker?: boolean;
  theme?: "auto" | "light" | "dark";
  compact?: boolean;
}

export interface EnergyFlowEntities {
  solar_power: string;
  inverter_power: string;
  battery_power: string;
  battery_soc: string;
  grid_power: string;
  house_consumption: string;
  breaker?: string;
  weather?: string;
  temp?: string;
  temp_min_today?: string;
  temp_max_today?: string;
}

/** Represents a computed flow between two nodes */
export interface FlowData {
  from: NodeId;
  to: NodeId;
  power: number; // watts
  direction: "forward" | "reverse";
}

/** Identifiers for all energy nodes */
export type NodeId = "solar" | "inverter" | "battery" | "home" | "grid" | "breaker";

/** State of a single node in the energy flow */
export interface NodeState {
  id: NodeId;
  label: string;
  icon: string;
  power: number;
  unit: string;
  color: string;
  secondaryValue?: string;
  secondaryLabel?: string;
}

/** Defaults for the card configuration */
export const defaultConfig: Partial<HCPowerFlowConfig> = {
  max_flow_kw: 10,
  show_weather: true,
  show_breaker: true,
  theme: "auto",
  compact: false,
};
