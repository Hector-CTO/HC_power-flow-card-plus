import { html, TemplateResult } from "lit";
import { HomeAssistant } from "custom-card-helpers";

/**
 * Weather condition → icon mapping
 */
const WEATHER_ICONS: Record<string, string> = {
  "clear-night": "mdi:weather-night",
  cloudy: "mdi:weather-cloudy",
  exceptional: "mdi:alert-circle-outline",
  fog: "mdi:weather-fog",
  hail: "mdi:weather-hail",
  lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy",
  partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring",
  rainy: "mdi:weather-rainy",
  snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy",
  sunny: "mdi:weather-sunny",
  windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant",
};

/**
 * Get the weather icon for a given condition string.
 */
function getWeatherIcon(condition?: string): string {
  if (!condition) return "mdi:weather-partly-cloudy";
  return WEATHER_ICONS[condition] || "mdi:weather-partly-cloudy";
}

/**
 * Format temperature value with unit.
 */
function formatTemp(value: number | string | undefined, unit = "°C"): string {
  if (value === undefined || value === null || value === "unavailable" || value === "unknown") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return `${Math.round(num)}${unit}`;
}

/**
 * Get day name from forecast date.
 */
function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

export interface WeatherData {
  temperature?: string | number;
  tempMin?: string | number;
  tempMax?: string | number;
  condition?: string;
  forecast?: Array<{
    datetime: string;
    condition: string;
    temperature: number;
    templow?: number;
  }>;
}

/**
 * Extracts weather data from Home Assistant state objects.
 */
export function getWeatherData(
  hass: HomeAssistant,
  entities: {
    weather?: string;
    temp?: string;
    temp_min_today?: string;
    temp_max_today?: string;
  }
): WeatherData | null {
  const weatherEntity = entities.weather ? hass.states[entities.weather] : undefined;

  if (!weatherEntity && !entities.temp) return null;

  const temperature =
    entities.temp && hass.states[entities.temp]
      ? hass.states[entities.temp].state
      : weatherEntity?.attributes?.temperature;

  const tempMin =
    entities.temp_min_today && hass.states[entities.temp_min_today]
      ? hass.states[entities.temp_min_today].state
      : undefined;

  const tempMax =
    entities.temp_max_today && hass.states[entities.temp_max_today]
      ? hass.states[entities.temp_max_today].state
      : undefined;

  const condition = weatherEntity?.state;
  const forecast = weatherEntity?.attributes?.forecast as WeatherData["forecast"];

  return { temperature, tempMin, tempMax, condition, forecast };
}

/**
 * Renders the compact weather strip component.
 */
export function weatherStripTemplate(weatherData: WeatherData | null): TemplateResult {
  if (!weatherData) {
    return html``;
  }

  const { temperature, tempMin, tempMax, condition, forecast } = weatherData;
  const icon = getWeatherIcon(condition);
  const unit = "°C";

  // Get next 2 days from forecast
  const futureDays = forecast?.slice(1, 3) || [];

  return html`
    <div class="efc-weather">
      <!-- Current conditions -->
      <div class="efc-weather__current">
        <ha-icon class="efc-weather__icon" icon=${icon}></ha-icon>
        <div>
          <div class="efc-weather__temp">${formatTemp(temperature, unit)}</div>
          ${tempMin !== undefined || tempMax !== undefined
            ? html`<div class="efc-weather__range">
                ${tempMin !== undefined ? html`<span>↓ ${formatTemp(tempMin, unit)}</span>` : ""}
                ${tempMax !== undefined ? html`<span> ↑ ${formatTemp(tempMax, unit)}</span>` : ""}
              </div>`
            : ""}
        </div>
      </div>

      <div class="efc-weather__divider"></div>

      <!-- Condition label -->
      <div class="efc-weather__details">
        <div class="efc-weather__detail-row">
          <span style="text-transform: capitalize;">${condition?.replace(/-/g, " ") || "—"}</span>
        </div>
      </div>

      <!-- Forecast -->
      ${futureDays.length > 0
        ? html`
            <div class="efc-weather__divider"></div>
            <div class="efc-weather__forecast">
              ${futureDays.map(
                (day) => html`
                  <div class="efc-weather__forecast-day">
                    <span>${getDayName(day.datetime)}</span>
                    <ha-icon icon=${getWeatherIcon(day.condition)}></ha-icon>
                    <span class="efc-weather__forecast-temp">${formatTemp(day.temperature, unit)}</span>
                    ${day.templow !== undefined
                      ? html`<span>${formatTemp(day.templow, unit)}</span>`
                      : ""}
                  </div>
                `
              )}
            </div>
          `
        : ""}
    </div>
  `;
}
