/* eslint-disable wc/guard-super-call */
import { HomeAssistant } from "custom-card-helpers";
import { html, LitElement, PropertyValues, TemplateResult, svg, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HCPowerFlowConfig, defaultConfig } from "./energy-flow-card-config";
import { hcPowerFlowStyles } from "./energy-flow-card-styles";
import { weatherStripTemplate, getWeatherData, WeatherData } from "./components/weather-strip";
import {
  computeFlows,
  ComputedFlows,
  computeFlowSpeed,
  getFlowPowerClass,
  formatPower,
  getBatteryIcon,
  getBatterySocClass,
  isEntityAvailable,
} from "./utils/flow-calculations";

// Register the card
const windowWithCards = window as unknown as Window & { customCards: unknown[] };
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
  type: "hc-power-flow",
  name: "HC Power Flow",
  description: "An isometric 3D energy flow dashboard showing Grid → Breaker → Inverter → Home with Solar and Battery branches.",
  preview: true,
});

@customElement("hc-power-flow")
export class HCPowerFlow extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: HCPowerFlowConfig;

  static getStubConfig(): object {
    return {
      type: "custom:hc-power-flow",
      title: "HC Power Flow",
      entities: {
        solar_power: "sensor.solar_power",
        inverter_power: "sensor.inverter_power",
        battery_power: "sensor.battery_power",
        battery_soc: "sensor.battery_soc",
        grid_power: "sensor.grid_power",
        house_consumption: "sensor.house_consumption",
      },
      max_flow_kw: 10,
      show_weather: true,
      show_breaker: true,
      theme: "auto",
      compact: false,
    };
  }

  public setConfig(config: HCPowerFlowConfig): void {
    if (!config.entities) {
      throw new Error("You must define entities.");
    }
    if (!config.entities.solar_power && !config.entities.grid_power) {
      throw new Error("At least solar_power or grid_power entity must be defined.");
    }

    this._config = {
      ...config,
      max_flow_kw: config.max_flow_kw ?? defaultConfig.max_flow_kw,
      show_weather: config.show_weather ?? defaultConfig.show_weather,
      show_breaker: config.show_breaker ?? defaultConfig.show_breaker,
      theme: config.theme ?? defaultConfig.theme,
      compact: config.compact ?? defaultConfig.compact,
    };
  }

  public getCardSize(): number {
    return this._config?.compact ? 3 : 5;
  }

  /**
   * Determine effective theme (light/dark).
   */
  private _getThemeClass(): string {
    if (!this._config) return "";
    if (this._config.theme === "light") return "";
    if (this._config.theme === "dark") return "dark";
    // Auto: check HA theme
    const isDark = this.hass?.themes?.darkMode ?? false;
    return isDark ? "dark" : "";
  }

  /**
   * Opens the more-info dialog for an entity.
   */
  private _handleNodeTap(entityId?: string): void {
    if (!entityId || !this.hass.states[entityId]) return;
    const evt = new CustomEvent("hass-more-info", {
      composed: true,
      detail: { entityId },
    });
    this.dispatchEvent(evt);
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) return html``;

    const { entities } = this._config;
    const maxFlowKw = this._config.max_flow_kw ?? 10;

    // Compute all flow data
    const flows = computeFlows(this.hass, this._config);

    // Weather data
    const weatherData: WeatherData | null =
      this._config.show_weather
        ? getWeatherData(this.hass, {
            weather: entities.weather,
            temp: entities.temp,
            temp_min_today: entities.temp_min_today,
            temp_max_today: entities.temp_max_today,
          })
        : null;

    const themeClass = this._getThemeClass();
    const compactClass = this._config.compact ? "compact" : "";
    const showBreaker = !!(this._config.show_breaker && entities.breaker);

    // Format power displays
    const solarDisplay = formatPower(flows.solarPower);
    const inverterDisplay = formatPower(flows.inverterPower);
    const batteryDisplay = formatPower(Math.abs(flows.batteryPower));
    const gridDisplay = formatPower(Math.abs(flows.gridPower));
    const homeDisplay = formatPower(flows.houseConsumption);

    // Battery state
    const isCharging = flows.batteryPower > 0;
    const batteryIcon = getBatteryIcon(flows.batterySoc, isCharging);
    const batterySocClass = getBatterySocClass(flows.batterySoc);

    // Grid state
    const gridImporting = flows.gridPower > 0;
    const gridClass = gridImporting ? "importing" : flows.gridPower < 0 ? "exporting" : "";

    return html`
      <ha-card>
        <div class="efc-canvas ${themeClass} ${compactClass}">
          ${this._config.title ? html`<div class="efc-title">${this._config.title}</div>` : nothing}
          ${this._config.show_weather ? weatherStripTemplate(weatherData) : nothing}

          <div class="efc-flow-layout ${compactClass}">
            <!-- SVG Flow Lines (behind nodes) -->
            ${this._renderFlowLines(flows, maxFlowKw, showBreaker)}

            <!-- === SOLAR NODE === -->
            <div
              class="efc-node efc-node--solar ${!isEntityAvailable(this.hass, entities.solar_power) ? "efc-node--unavailable" : ""}"
              @click=${() => this._handleNodeTap(entities.solar_power)}
            >
              <div class="efc-node__icon-wrap">
                <ha-icon icon="mdi:solar-power"></ha-icon>
              </div>
              <div class="efc-node__value">${solarDisplay.value}<span class="efc-node__unit">${solarDisplay.unit}</span></div>
              <div class="efc-node__label">Solar</div>
            </div>

            <!-- === GRID NODE === -->
            <div
              class="efc-node efc-node--grid ${gridClass} ${!isEntityAvailable(this.hass, entities.grid_power) ? "efc-node--unavailable" : ""}"
              @click=${() => this._handleNodeTap(entities.grid_power)}
            >
              <div class="efc-node__icon-wrap">
                <ha-icon icon="mdi:transmission-tower"></ha-icon>
              </div>
              <div class="efc-node__value">${gridDisplay.value}<span class="efc-node__unit">${gridDisplay.unit}</span></div>
              <div class="efc-node__label">Grid</div>
              <div class="efc-node__secondary">${gridImporting ? "Import" : flows.gridPower < 0 ? "Export" : "Idle"}</div>
            </div>

            <!-- === BREAKER NODE (conditional) === -->
            ${showBreaker
              ? html`
                  <div
                    class="efc-node efc-node--breaker ${!flows.breakerOn ? "off" : ""} ${!isEntityAvailable(this.hass, entities.breaker) ? "efc-node--unavailable" : ""}"
                    @click=${() => this._handleNodeTap(entities.breaker)}
                  >
                    <div class="efc-node__icon-wrap">
                      <ha-icon icon="mdi:electric-switch"></ha-icon>
                    </div>
                    <div class="efc-node__value">${flows.breakerOn ? "ON" : "OFF"}</div>
                    <div class="efc-node__label">Breaker</div>
                  </div>
                `
              : html`<div></div>`}

            <!-- === INVERTER NODE === -->
            <div
              class="efc-node efc-node--inverter ${!isEntityAvailable(this.hass, entities.inverter_power) ? "efc-node--unavailable" : ""}"
              @click=${() => this._handleNodeTap(entities.inverter_power)}
            >
              <div class="efc-node__icon-wrap">
                <ha-icon icon="mdi:flash"></ha-icon>
              </div>
              <div class="efc-node__value">${inverterDisplay.value}<span class="efc-node__unit">${inverterDisplay.unit}</span></div>
              <div class="efc-node__label">Inverter</div>
            </div>

            <!-- Spacer for grid column 4 -->
            <div></div>

            <!-- === HOME NODE === -->
            <div
              class="efc-node efc-node--home ${!isEntityAvailable(this.hass, entities.house_consumption) ? "efc-node--unavailable" : ""}"
              @click=${() => this._handleNodeTap(entities.house_consumption)}
            >
              <div class="efc-node__icon-wrap">
                <ha-icon icon="mdi:home"></ha-icon>
              </div>
              <div class="efc-node__value">${homeDisplay.value}<span class="efc-node__unit">${homeDisplay.unit}</span></div>
              <div class="efc-node__label">Home</div>
            </div>

            <!-- Spacers for row 3 -->
            <div></div>
            <div></div>

            <!-- === BATTERY NODE === -->
            <div
              class="efc-node efc-node--battery ${batterySocClass} ${!isEntityAvailable(this.hass, entities.battery_power) ? "efc-node--unavailable" : ""}"
              @click=${() => this._handleNodeTap(entities.battery_power)}
            >
              <div class="efc-node__icon-wrap">
                <ha-icon icon=${batteryIcon}></ha-icon>
              </div>
              <div class="efc-node__value">${batteryDisplay.value}<span class="efc-node__unit">${batteryDisplay.unit}</span></div>
              <div class="efc-node__label">${isCharging ? "Charging" : "Battery"}</div>
              <div class="efc-soc-bar">
                <div
                  class="efc-soc-bar__fill ${batterySocClass}"
                  style="width: ${flows.batterySoc}%"
                ></div>
              </div>
              <div class="efc-node__secondary">${Math.round(flows.batterySoc)}%</div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Render the SVG flow lines connecting nodes.
   * Uses an absolute-positioned SVG overlaying the grid layout.
   * Lines are drawn with computed coordinates based on node positions.
   */
  private _renderFlowLines(flows: ComputedFlows, maxFlowKw: number, showBreaker?: boolean): TemplateResult {
    // We define flow paths relative to the grid layout.
    // Each node center is computed based on the 5-column, 3-row grid.
    // Column centers: 10%, 30%, 50%, 70%, 90%
    // Row centers: roughly 17%, 50%, 83%

    const cols = [10, 30, 50, 70, 90]; // percentages
    const rows = [16, 50, 84];

    // Node positions (col, row)
    const pos = {
      solar:    { x: cols[2], y: rows[0] },
      grid:     { x: cols[0], y: rows[1] },
      breaker:  { x: cols[1], y: rows[1] },
      inverter: { x: cols[2], y: rows[1] },
      home:     { x: cols[4], y: rows[1] },
      battery:  { x: cols[2], y: rows[2] },
    };

    const flowLines: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      power: number;
      colorClass: string;
      reverse?: boolean;
      id: string;
    }> = [];

    // Solar → Inverter
    if (flows.solarToInverter > 0) {
      flowLines.push({
        from: pos.solar, to: pos.inverter,
        power: flows.solarToInverter, colorClass: "flow-solar", id: "solar-inv",
      });
    }

    // Grid → Breaker (if breaker shown)
    if (showBreaker && flows.gridToBreaker > 0) {
      flowLines.push({
        from: pos.grid, to: pos.breaker,
        power: flows.gridToBreaker, colorClass: "flow-grid-import", id: "grid-brk",
      });
      // Breaker → Inverter
      if (flows.breakerToInverter > 0) {
        flowLines.push({
          from: pos.breaker, to: pos.inverter,
          power: flows.breakerToInverter, colorClass: "flow-grid-import", id: "brk-inv",
        });
      }
    } else if (flows.gridToBreaker > 0) {
      // Direct grid → inverter (no breaker)
      flowLines.push({
        from: pos.grid, to: pos.inverter,
        power: flows.gridToBreaker, colorClass: "flow-grid-import", id: "grid-inv",
      });
    }

    // Inverter → Grid (export)
    if (flows.inverterToGrid > 0) {
      if (showBreaker) {
        flowLines.push({
          from: pos.inverter, to: pos.breaker,
          power: flows.inverterToGrid, colorClass: "flow-grid-export", id: "inv-brk-exp", reverse: true,
        });
        flowLines.push({
          from: pos.breaker, to: pos.grid,
          power: flows.inverterToGrid, colorClass: "flow-grid-export", id: "brk-grid-exp", reverse: true,
        });
      } else {
        flowLines.push({
          from: pos.inverter, to: pos.grid,
          power: flows.inverterToGrid, colorClass: "flow-grid-export", id: "inv-grid-exp", reverse: true,
        });
      }
    }

    // Inverter → Home
    if (flows.inverterToHome > 0) {
      flowLines.push({
        from: pos.inverter, to: pos.home,
        power: flows.inverterToHome, colorClass: "flow-home", id: "inv-home",
      });
    }

    // Inverter → Battery (charging)
    if (flows.inverterToBattery > 0) {
      flowLines.push({
        from: pos.inverter, to: pos.battery,
        power: flows.inverterToBattery, colorClass: "flow-battery-in", id: "inv-bat",
      });
    }

    // Battery → Inverter (discharging)
    if (flows.batteryToInverter > 0) {
      flowLines.push({
        from: pos.battery, to: pos.inverter,
        power: flows.batteryToInverter, colorClass: "flow-battery-out", id: "bat-inv",
      });
    }

    // Render zero-power placeholders for idle lines
    const allPossibleFlows = [
      { from: pos.solar, to: pos.inverter, id: "solar-inv-idle" },
      { from: pos.inverter, to: pos.home, id: "inv-home-idle" },
      { from: pos.inverter, to: pos.battery, id: "inv-bat-idle" },
    ];
    if (showBreaker) {
      allPossibleFlows.push({ from: pos.grid, to: pos.breaker, id: "grid-brk-idle" });
      allPossibleFlows.push({ from: pos.breaker, to: pos.inverter, id: "brk-inv-idle" });
    } else {
      allPossibleFlows.push({ from: pos.grid, to: pos.inverter, id: "grid-inv-idle" });
    }

    return html`
      <svg class="efc-flows-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <!-- Idle placeholder lines -->
        ${allPossibleFlows.map(
          (f) => svg`
            <line
              x1="${f.from.x}" y1="${f.from.y}"
              x2="${f.to.x}" y2="${f.to.y}"
              class="efc-flow-line zero"
              stroke="var(--disabled-text-color, #ccc)"
            />
          `
        )}

        <!-- Active flow lines with animation -->
        ${flowLines.map((f) => {
          const pClass = getFlowPowerClass(f.power, maxFlowKw);
          const speed = computeFlowSpeed(f.power, maxFlowKw);
          const animClass = f.power > 0 ? "animated" : "";
          const reverseClass = f.reverse ? "reverse" : "";

          return svg`
            <line
              x1="${f.from.x}" y1="${f.from.y}"
              x2="${f.to.x}" y2="${f.to.y}"
              class="efc-flow-line active ${pClass} ${animClass} ${reverseClass} ${f.colorClass}"
              style="--efc-flow-animation-speed: ${speed}"
            />
          `;
        })}
      </svg>
    `;
  }

  static styles = hcPowerFlowStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-power-flow": HCPowerFlow;
  }
}
