import { html, LitElement, TemplateResult, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { HCPowerFlowConfig } from "./energy-flow-card-config";

/**
 * Visual config editor for the HC Power Flow card.
 * Provides form fields for all configuration options.
 */
@customElement("hc-power-flow-editor")
export class HCPowerFlowEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: HCPowerFlowConfig;

  public setConfig(config: HCPowerFlowConfig): void {
    this._config = { ...config };
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) return;
    const target = ev.target as any;
    const configKey = target.configValue;
    const value = ev.detail?.value ?? target.value ?? target.checked;

    if (configKey) {
      if (configKey.startsWith("entities.")) {
        const entityKey = configKey.replace("entities.", "");
        this._config = {
          ...this._config,
          entities: {
            ...this._config.entities,
            [entityKey]: value,
          },
        };
      } else {
        (this._config as any)[configKey] = value;
      }
      this._dispatchChange();
    }
  }

  private _dispatchChange(): void {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="card-config">
        <h3>General</h3>
        <ha-textfield
          label="Title"
          .value=${this._config.title || ""}
          .configValue=${"title"}
          @input=${this._valueChanged}
        ></ha-textfield>

        <ha-select
          label="Theme"
          .value=${this._config.theme || "auto"}
          .configValue=${"theme"}
          @selected=${this._valueChanged}
          @closed=${(e: Event) => e.stopPropagation()}
        >
          <mwc-list-item value="auto">Auto</mwc-list-item>
          <mwc-list-item value="light">Light</mwc-list-item>
          <mwc-list-item value="dark">Dark</mwc-list-item>
        </ha-select>

        <ha-textfield
          label="Max Flow (kW)"
          type="number"
          .value=${String(this._config.max_flow_kw ?? 10)}
          .configValue=${"max_flow_kw"}
          @input=${this._valueChanged}
        ></ha-textfield>

        <ha-formfield label="Compact mode">
          <ha-switch
            .checked=${this._config.compact ?? false}
            .configValue=${"compact"}
            @change=${this._valueChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield label="Show weather strip">
          <ha-switch
            .checked=${this._config.show_weather ?? true}
            .configValue=${"show_weather"}
            @change=${this._valueChanged}
          ></ha-switch>
        </ha-formfield>

        <ha-formfield label="Show breaker">
          <ha-switch
            .checked=${this._config.show_breaker ?? true}
            .configValue=${"show_breaker"}
            @change=${this._valueChanged}
          ></ha-switch>
        </ha-formfield>

        <h3>Required Entities</h3>
        <ha-entity-picker
          label="Solar Power"
          .hass=${this.hass}
          .value=${this._config.entities?.solar_power || ""}
          .configValue=${"entities.solar_power"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          label="Inverter Power"
          .hass=${this.hass}
          .value=${this._config.entities?.inverter_power || ""}
          .configValue=${"entities.inverter_power"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          label="Battery Power"
          .hass=${this.hass}
          .value=${this._config.entities?.battery_power || ""}
          .configValue=${"entities.battery_power"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          label="Battery SOC"
          .hass=${this.hass}
          .value=${this._config.entities?.battery_soc || ""}
          .configValue=${"entities.battery_soc"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          label="Grid Power"
          .hass=${this.hass}
          .value=${this._config.entities?.grid_power || ""}
          .configValue=${"entities.grid_power"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          label="House Consumption"
          .hass=${this.hass}
          .value=${this._config.entities?.house_consumption || ""}
          .configValue=${"entities.house_consumption"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <h3>Optional Entities</h3>
        <ha-entity-picker
          label="Main Breaker (binary_sensor)"
          .hass=${this.hass}
          .value=${this._config.entities?.breaker || ""}
          .configValue=${"entities.breaker"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
          include-domains='["binary_sensor"]'
        ></ha-entity-picker>

        <ha-entity-picker
          label="Weather Entity"
          .hass=${this.hass}
          .value=${this._config.entities?.weather || ""}
          .configValue=${"entities.weather"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
          include-domains='["weather"]'
        ></ha-entity-picker>

        <ha-entity-picker
          label="Outdoor Temperature"
          .hass=${this.hass}
          .value=${this._config.entities?.temp || ""}
          .configValue=${"entities.temp"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          label="Today Min Temperature"
          .hass=${this.hass}
          .value=${this._config.entities?.temp_min_today || ""}
          .configValue=${"entities.temp_min_today"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          label="Today Max Temperature"
          .hass=${this.hass}
          .value=${this._config.entities?.temp_max_today || ""}
          .configValue=${"entities.temp_max_today"}
          @value-changed=${this._valueChanged}
          allow-custom-entity
        ></ha-entity-picker>
      </div>
    `;
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }

    h3 {
      margin: 16px 0 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 4px;
    }

    h3:first-child {
      margin-top: 0;
    }

    ha-entity-picker,
    ha-textfield,
    ha-select {
      display: block;
      margin-bottom: 12px;
    }

    ha-formfield {
      display: block;
      margin-bottom: 8px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-power-flow-editor": HCPowerFlowEditor;
  }
}
