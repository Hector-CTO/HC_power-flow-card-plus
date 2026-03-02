import { css } from "lit";

/**
 * Isometric 3D styles for the HC Power Flow card.
 * Features: diagonal grid background, soft-3D tiles, animated flows,
 * glassmorphism effects, and responsive layout.
 */
export const hcPowerFlowStyles = css`
  /* ============================================
     HOST & THEME VARIABLES
     ============================================ */
  :host {
    /* Node colors */
    --efc-solar-color: #f5a623;
    --efc-inverter-color: #7b68ee;
    --efc-battery-color: #4caf50;
    --efc-battery-low-color: #f44336;
    --efc-battery-mid-color: #ff9800;
    --efc-home-color: #2196f3;
    --efc-grid-color: #9e9e9e;
    --efc-grid-import-color: #f44336;
    --efc-grid-export-color: #4caf50;
    --efc-breaker-color: #ff5722;
    --efc-breaker-on-color: #4caf50;
    --efc-breaker-off-color: #f44336;

    /* Canvas */
    --efc-bg-color: #f0f4f8;
    --efc-bg-dark: #1a1a2e;
    --efc-grid-line-color: rgba(0, 0, 0, 0.04);
    --efc-grid-line-dark: rgba(255, 255, 255, 0.04);

    /* Tile */
    --efc-tile-bg: rgba(255, 255, 255, 0.85);
    --efc-tile-bg-dark: rgba(30, 30, 50, 0.85);
    --efc-tile-border: rgba(255, 255, 255, 0.6);
    --efc-tile-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    --efc-tile-shadow-dark: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);

    /* Flow lines */
    --efc-flow-line-width: 3px;
    --efc-flow-dot-size: 6px;
    --efc-flow-animation-speed: 1.5s;

    /* Weather */
    --efc-weather-bg: rgba(255, 255, 255, 0.7);
    --efc-weather-bg-dark: rgba(30, 30, 50, 0.7);

    /* Typography */
    --efc-font-size-label: 11px;
    --efc-font-size-value: 16px;
    --efc-font-size-unit: 10px;
    --efc-font-size-secondary: 10px;

    display: block;
    font-family: var(--ha-card-header-font-family, inherit);
  }

  /* ============================================
     HA-CARD CONTAINER
     ============================================ */
  ha-card {
    overflow: hidden;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* ============================================
     CANVAS WITH DIAGONAL GRID
     ============================================ */
  .efc-canvas {
    position: relative;
    padding: 16px;
    min-height: 380px;
    background-color: var(--efc-bg-color);
    background-image:
      linear-gradient(45deg, var(--efc-grid-line-color) 25%, transparent 25%),
      linear-gradient(-45deg, var(--efc-grid-line-color) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--efc-grid-line-color) 75%),
      linear-gradient(-45deg, transparent 75%, var(--efc-grid-line-color) 75%);
    background-size: 30px 30px;
    background-position: 0 0, 0 15px, 15px -15px, -15px 0;
    border-radius: 16px;
    transition: background-color 0.3s ease;
  }

  :host([theme="dark"]) .efc-canvas,
  .efc-canvas.dark {
    background-color: var(--efc-bg-dark);
    background-image:
      linear-gradient(45deg, var(--efc-grid-line-dark) 25%, transparent 25%),
      linear-gradient(-45deg, var(--efc-grid-line-dark) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--efc-grid-line-dark) 75%),
      linear-gradient(-45deg, transparent 75%, var(--efc-grid-line-dark) 75%);
  }

  /* ============================================
     TITLE
     ============================================ */
  .efc-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text-color);
    margin: 0 0 12px 4px;
    letter-spacing: 0.3px;
  }

  /* ============================================
     FLOW LAYOUT (Main Grid)
     ============================================ */
  .efc-flow-layout {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 8px;
    align-items: center;
    justify-items: center;
    position: relative;
    padding: 16px 0;
  }

  .efc-flow-layout.compact {
    gap: 4px;
    padding: 8px 0;
  }

  /* Node grid positions */
  .efc-node--solar     { grid-column: 3; grid-row: 1; }
  .efc-node--grid      { grid-column: 1; grid-row: 2; }
  .efc-node--breaker   { grid-column: 2; grid-row: 2; }
  .efc-node--inverter  { grid-column: 3; grid-row: 2; }
  .efc-node--battery   { grid-column: 3; grid-row: 3; }
  .efc-node--home      { grid-column: 5; grid-row: 2; }

  /* ============================================
     ISOMETRIC 3D TILE NODE
     ============================================ */
  .efc-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border-radius: 20px;
    background: var(--efc-tile-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--efc-tile-border);
    box-shadow: var(--efc-tile-shadow);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    position: relative;
    z-index: 2;
    /* Isometric perspective */
    transform: perspective(600px) rotateX(5deg) rotateY(0deg);
  }

  .efc-node:hover {
    transform: perspective(600px) rotateX(2deg) rotateY(0deg) translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .efc-node:active {
    transform: perspective(600px) rotateX(5deg) scale(0.97);
  }

  :host([theme="dark"]) .efc-node,
  .dark .efc-node {
    background: var(--efc-tile-bg-dark);
    box-shadow: var(--efc-tile-shadow-dark);
  }

  /* Node icon circle */
  .efc-node__icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    transition: background-color 0.3s ease;
  }

  .efc-node__icon-wrap ha-icon {
    --mdc-icon-size: 22px;
    color: #fff;
  }

  /* Per-node icon background colors */
  .efc-node--solar .efc-node__icon-wrap     { background: var(--efc-solar-color); }
  .efc-node--inverter .efc-node__icon-wrap  { background: var(--efc-inverter-color); }
  .efc-node--battery .efc-node__icon-wrap   { background: var(--efc-battery-color); }
  .efc-node--home .efc-node__icon-wrap      { background: var(--efc-home-color); }
  .efc-node--grid .efc-node__icon-wrap      { background: var(--efc-grid-color); }
  .efc-node--breaker .efc-node__icon-wrap   { background: var(--efc-breaker-on-color); }

  .efc-node--grid.importing .efc-node__icon-wrap { background: var(--efc-grid-import-color); }
  .efc-node--grid.exporting .efc-node__icon-wrap { background: var(--efc-grid-export-color); }
  .efc-node--breaker.off .efc-node__icon-wrap    { background: var(--efc-breaker-off-color); }

  .efc-node--battery.low .efc-node__icon-wrap  { background: var(--efc-battery-low-color); }
  .efc-node--battery.mid .efc-node__icon-wrap  { background: var(--efc-battery-mid-color); }

  /* Node label + value text */
  .efc-node__label {
    font-size: var(--efc-font-size-label);
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
    line-height: 1;
  }

  .efc-node__value {
    font-size: var(--efc-font-size-value);
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1.2;
  }

  .efc-node__unit {
    font-size: var(--efc-font-size-unit);
    font-weight: 400;
    color: var(--secondary-text-color);
    margin-left: 2px;
  }

  .efc-node__secondary {
    font-size: var(--efc-font-size-secondary);
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  /* SOC bar inside battery node */
  .efc-soc-bar {
    width: 60px;
    height: 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.1);
    margin-top: 4px;
    overflow: hidden;
  }

  .efc-soc-bar__fill {
    height: 100%;
    border-radius: 2px;
    background: var(--efc-battery-color);
    transition: width 0.5s ease, background-color 0.5s ease;
  }

  .efc-soc-bar__fill.low  { background: var(--efc-battery-low-color); }
  .efc-soc-bar__fill.mid  { background: var(--efc-battery-mid-color); }

  /* ============================================
     SVG FLOW LINES - ANIMATED
     ============================================ */
  .efc-flows-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .efc-flow-line {
    fill: none;
    stroke-width: var(--efc-flow-line-width);
    stroke-linecap: round;
    opacity: 0.6;
    transition: stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease;
  }

  .efc-flow-line.active {
    opacity: 1;
  }

  .efc-flow-line.zero {
    opacity: 0.15;
    stroke-dasharray: 4 4;
  }

  /* Animated dot along flow paths */
  .efc-flow-dot {
    r: 3.5;
    fill: currentColor;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .efc-flow-dot.hidden {
    display: none;
  }

  @keyframes flow-forward {
    0%   { offset-distance: 0%; }
    100% { offset-distance: 100%; }
  }

  @keyframes flow-reverse {
    0%   { offset-distance: 100%; }
    100% { offset-distance: 0%; }
  }

  /* Flow line color classes */
  .flow-solar       { stroke: var(--efc-solar-color); color: var(--efc-solar-color); }
  .flow-battery-in  { stroke: var(--efc-battery-color); color: var(--efc-battery-color); }
  .flow-battery-out { stroke: #66bb6a; color: #66bb6a; }
  .flow-grid-import { stroke: var(--efc-grid-import-color); color: var(--efc-grid-import-color); }
  .flow-grid-export { stroke: var(--efc-grid-export-color); color: var(--efc-grid-export-color); }
  .flow-home        { stroke: var(--efc-home-color); color: var(--efc-home-color); }
  .flow-inverter    { stroke: var(--efc-inverter-color); color: var(--efc-inverter-color); }
  .flow-breaker     { stroke: var(--efc-breaker-on-color); color: var(--efc-breaker-on-color); }

  /* ============================================
     WEATHER STRIP
     ============================================ */
  .efc-weather {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    margin-bottom: 12px;
    border-radius: 12px;
    background: var(--efc-weather-bg);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .efc-weather::-webkit-scrollbar {
    display: none;
  }

  :host([theme="dark"]) .efc-weather,
  .dark .efc-weather {
    background: var(--efc-weather-bg-dark);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .efc-weather__current {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .efc-weather__icon {
    --mdc-icon-size: 28px;
    color: var(--efc-solar-color);
  }

  .efc-weather__temp {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1;
  }

  .efc-weather__range {
    font-size: 11px;
    color: var(--secondary-text-color);
    line-height: 1.3;
  }

  .efc-weather__divider {
    width: 1px;
    height: 36px;
    background: rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .efc-weather__details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }

  .efc-weather__detail-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--secondary-text-color);
  }

  .efc-weather__detail-row ha-icon {
    --mdc-icon-size: 14px;
    color: var(--secondary-text-color);
  }

  .efc-weather__forecast {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    margin-left: auto;
  }

  .efc-weather__forecast-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 10px;
    color: var(--secondary-text-color);
  }

  .efc-weather__forecast-day ha-icon {
    --mdc-icon-size: 20px;
  }

  .efc-weather__forecast-temp {
    font-weight: 600;
    color: var(--primary-text-color);
  }

  /* ============================================
     TOOLTIP
     ============================================ */
  .efc-tooltip {
    position: absolute;
    background: var(--efc-tile-bg);
    backdrop-filter: blur(12px);
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    font-size: 12px;
    color: var(--primary-text-color);
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .efc-tooltip.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ============================================
     UNAVAILABLE / ERROR STATE
     ============================================ */
  .efc-node--unavailable {
    opacity: 0.4;
  }

  .efc-node--unavailable .efc-node__icon-wrap {
    background: var(--disabled-text-color, #999) !important;
  }

  .efc-error {
    padding: 16px;
    color: var(--error-color, #db4437);
    font-size: 14px;
    text-align: center;
  }

  /* ============================================
     RESPONSIVE
     ============================================ */
  @media (max-width: 400px) {
    .efc-node {
      width: 80px;
      height: 80px;
      border-radius: 16px;
    }

    .efc-node__icon-wrap {
      width: 32px;
      height: 32px;
    }

    .efc-node__icon-wrap ha-icon {
      --mdc-icon-size: 18px;
    }

    .efc-node__value {
      font-size: 13px;
    }

    .efc-flow-layout {
      gap: 4px;
    }

    .efc-weather {
      gap: 8px;
      padding: 6px 10px;
    }
  }

  /* ============================================
     ANIMATIONS
     ============================================ */
  @keyframes pulse-glow {
    0%, 100% { filter: drop-shadow(0 0 3px currentColor); }
    50%      { filter: drop-shadow(0 0 8px currentColor); }
  }

  .efc-node--active {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes dash-flow {
    to { stroke-dashoffset: -20; }
  }

  .efc-flow-line.animated {
    stroke-dasharray: 6 4;
    animation: dash-flow var(--efc-flow-animation-speed) linear infinite;
  }

  .efc-flow-line.animated.reverse {
    animation-direction: reverse;
  }

  /* Scale line width based on power */
  .efc-flow-line.power-xs { stroke-width: 1.5px; }
  .efc-flow-line.power-sm { stroke-width: 2.5px; }
  .efc-flow-line.power-md { stroke-width: 3.5px; }
  .efc-flow-line.power-lg { stroke-width: 5px; }
  .efc-flow-line.power-xl { stroke-width: 7px; }

  /* Compact mode adjustments */
  .efc-canvas.compact {
    min-height: 280px;
    padding: 12px;
  }

  .efc-canvas.compact .efc-node {
    width: 80px;
    height: 80px;
  }

  .efc-canvas.compact .efc-weather {
    padding: 4px 10px;
  }
`;
