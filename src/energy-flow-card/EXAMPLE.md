# HC Power Flow - Example Usage

## Basic Configuration
```yaml
type: custom:hc-power-flow
title: HC Power Flow
entities:
  solar_power: sensor.solar_power
  inverter_power: sensor.inverter_power
  battery_power: sensor.battery_power
  battery_soc: sensor.battery_soc
  grid_power: sensor.grid_power
  house_consumption: sensor.house_consumption
```

## Full Configuration (with weather & breaker)
```yaml
type: custom:hc-power-flow
title: HC Power Flow
entities:
  solar_power: sensor.solar_power
  inverter_power: sensor.inverter_power
  battery_power: sensor.battery_power
  battery_soc: sensor.battery_soc
  grid_power: sensor.grid_power
  house_consumption: sensor.house_consumption
  breaker: binary_sensor.main_breaker
  weather: weather.home
  temp: sensor.outdoor_temperature
  temp_min_today: sensor.temp_min_today
  temp_max_today: sensor.temp_max_today
max_flow_kw: 10
show_weather: true
show_breaker: true
theme: auto
compact: false
```

## Compact Mode (dark theme)
```yaml
type: custom:hc-power-flow
title: Energy
entities:
  solar_power: sensor.solar_power
  inverter_power: sensor.inverter_power
  battery_power: sensor.battery_power
  battery_soc: sensor.battery_soc
  grid_power: sensor.grid_power
  house_consumption: sensor.house_consumption
max_flow_kw: 8
show_weather: false
show_breaker: false
theme: dark
compact: true
```

## Installation

### HACS (Manual)
1. In HACS, go to Frontend > Custom Repositories
2. Add this repository URL
3. Install "HC Power Flow"
4. Add the resource in your Lovelace configuration:
```yaml
resources:
  - url: /hacsfiles/power-flow-card-plus/hc-power-flow.js
    type: module
```

### Manual
1. Build with `pnpm build`
2. Copy `dist/hc-power-flow.js` to `config/www/`
3. Add the resource:
```yaml
resources:
  - url: /local/hc-power-flow.js
    type: module
```

## Entity Conventions

| Entity | Expected Unit | Sign Convention |
|--------|--------------|-----------------|
| `solar_power` | W | Positive = producing |
| `inverter_power` | W | Absolute value displayed |
| `battery_power` | W | Positive = charging, Negative = discharging |
| `battery_soc` | % | 0–100 |
| `grid_power` | W | Positive = importing, Negative = exporting |
| `house_consumption` | W | Positive = consuming |
| `breaker` | on/off | on = closed/connected |

## Visual Features
- **Isometric 3D tiles** with glassmorphism effect
- **Diagonal grid background** canvas
- **Animated directional flow lines** that scale width by power
- **Dynamic battery icon** based on SOC level
- **Color-coded grid status** (import = red, export = green)
- **Weather strip** with current temp, range, and 2-day forecast
- **Responsive layout** for various card widths
- **Light/dark theme** with auto-detection
