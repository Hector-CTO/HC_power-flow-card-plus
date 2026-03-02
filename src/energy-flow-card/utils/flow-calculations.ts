import { HomeAssistant } from "custom-card-helpers";
import { HCPowerFlowConfig, NodeId } from "../energy-flow-card-config";

/**
 * Computed flow values from entities.
 */
export interface ComputedFlows {
  // Power values in watts (positive = generation/discharge/import)
  solarPower: number;
  inverterPower: number;
  batteryPower: number; // positive = charging, negative = discharging
  batterySoc: number;   // 0-100
  gridPower: number;    // positive = importing, negative = exporting
  houseConsumption: number;
  breakerOn: boolean;

  // Derived flows
  solarToInverter: number;
  inverterToHome: number;
  inverterToBattery: number;
  batteryToInverter: number;
  gridToBreaker: number;
  breakerToInverter: number;
  inverterToGrid: number;
}

/**
 * Safely read a numeric state from HA entity.
 */
function getNumericState(hass: HomeAssistant, entityId?: string): number {
  if (!entityId) return 0;
  const stateObj = hass.states[entityId];
  if (!stateObj) return 0;
  const val = parseFloat(stateObj.state);
  return isNaN(val) ? 0 : val;
}

/**
 * Check if an entity is available
 */
export function isEntityAvailable(hass: HomeAssistant, entityId?: string): boolean {
  if (!entityId) return false;
  const stateObj = hass.states[entityId];
  if (!stateObj) return false;
  return stateObj.state !== "unavailable" && stateObj.state !== "unknown";
}

/**
 * Compute all flow values from HA entities.
 * Dynamically adjusts direction based on positive/negative values.
 */
export function computeFlows(hass: HomeAssistant, config: HCPowerFlowConfig): ComputedFlows {
  const { entities } = config;

  const solarPower = Math.max(0, getNumericState(hass, entities.solar_power));
  const inverterPower = getNumericState(hass, entities.inverter_power);
  const batteryPower = getNumericState(hass, entities.battery_power);
  const batterySoc = getNumericState(hass, entities.battery_soc);
  const gridPower = getNumericState(hass, entities.grid_power);
  const houseConsumption = Math.max(0, getNumericState(hass, entities.house_consumption));

  // Breaker state
  const breakerEntity = entities.breaker ? hass.states[entities.breaker] : undefined;
  const breakerOn = breakerEntity ? breakerEntity.state === "on" : true;

  // Solar → Inverter (always positive or zero)
  const solarToInverter = solarPower;

  // Battery flows
  const isCharging = batteryPower > 0;
  const inverterToBattery = isCharging ? Math.abs(batteryPower) : 0;
  const batteryToInverter = !isCharging ? Math.abs(batteryPower) : 0;

  // Grid flows
  const isImporting = gridPower > 0;
  const gridToBreaker = isImporting ? Math.abs(gridPower) : 0;
  const inverterToGrid = !isImporting ? Math.abs(gridPower) : 0;

  // Breaker → Inverter (same as grid import if breaker is on)
  const breakerToInverter = breakerOn ? gridToBreaker : 0;

  // Inverter → Home
  const inverterToHome = houseConsumption;

  return {
    solarPower,
    inverterPower: Math.abs(inverterPower),
    batteryPower,
    batterySoc: Math.max(0, Math.min(100, batterySoc)),
    gridPower,
    houseConsumption,
    breakerOn,
    solarToInverter,
    inverterToHome,
    inverterToBattery,
    batteryToInverter,
    gridToBreaker,
    breakerToInverter,
    inverterToGrid,
  };
}

/**
 * Compute the flow animation speed based on power level.
 * Higher power = faster animation.
 */
export function computeFlowSpeed(powerWatts: number, maxFlowKw: number): string {
  if (powerWatts <= 0) return "0s";
  const maxWatts = maxFlowKw * 1000;
  const ratio = Math.min(powerWatts / maxWatts, 1);
  // Speed range: 3s (slow) to 0.5s (fast)
  const speed = 3 - ratio * 2.5;
  return `${speed.toFixed(1)}s`;
}

/**
 * Determine line thickness class based on power relative to max.
 */
export function getFlowPowerClass(powerWatts: number, maxFlowKw: number): string {
  if (powerWatts <= 0) return "zero";
  const ratio = powerWatts / (maxFlowKw * 1000);
  if (ratio < 0.1) return "power-xs";
  if (ratio < 0.3) return "power-sm";
  if (ratio < 0.6) return "power-md";
  if (ratio < 0.85) return "power-lg";
  return "power-xl";
}

/**
 * Format watt/kilowatt display value.
 */
export function formatPower(watts: number): { value: string; unit: string } {
  const absWatts = Math.abs(watts);
  if (absWatts >= 1000) {
    return { value: (absWatts / 1000).toFixed(1), unit: "kW" };
  }
  return { value: Math.round(absWatts).toString(), unit: "W" };
}

/**
 * Get the appropriate battery icon based on SOC.
 */
export function getBatteryIcon(soc: number, isCharging: boolean): string {
  if (isCharging) {
    if (soc >= 90) return "mdi:battery-charging-100";
    if (soc >= 70) return "mdi:battery-charging-80";
    if (soc >= 50) return "mdi:battery-charging-60";
    if (soc >= 30) return "mdi:battery-charging-40";
    return "mdi:battery-charging-20";
  }
  if (soc >= 90) return "mdi:battery";
  if (soc >= 70) return "mdi:battery-80";
  if (soc >= 50) return "mdi:battery-60";
  if (soc >= 30) return "mdi:battery-40";
  if (soc >= 10) return "mdi:battery-20";
  return "mdi:battery-outline";
}

/**
 * Get SOC color class.
 */
export function getBatterySocClass(soc: number): string {
  if (soc <= 20) return "low";
  if (soc <= 50) return "mid";
  return "";
}

/**
 * Node configuration map.
 */
export interface NodeConfig {
  id: NodeId;
  icon: string;
  label: string;
  color: string;
}

export const NODE_CONFIGS: Record<NodeId, NodeConfig> = {
  solar:    { id: "solar", icon: "mdi:solar-power", label: "Solar", color: "var(--efc-solar-color)" },
  inverter: { id: "inverter", icon: "mdi:flash", label: "Inverter", color: "var(--efc-inverter-color)" },
  battery:  { id: "battery", icon: "mdi:battery", label: "Battery", color: "var(--efc-battery-color)" },
  home:     { id: "home", icon: "mdi:home", label: "Home", color: "var(--efc-home-color)" },
  grid:     { id: "grid", icon: "mdi:transmission-tower", label: "Grid", color: "var(--efc-grid-color)" },
  breaker:  { id: "breaker", icon: "mdi:electric-switch", label: "Breaker", color: "var(--efc-breaker-on-color)" },
};
