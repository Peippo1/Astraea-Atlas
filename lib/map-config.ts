export type ColorMetric = "discoveryYear" | "radius" | "mass" | "distance" | "method";

export type MapConfig = {
  discoveryMethod: string;
  discoveryYearRange: [number, number];
  colorMetric: ColorMetric;
  autoRotate: boolean;
};

export const DEFAULT_MAP_CONFIG: MapConfig = {
  discoveryMethod: "All methods",
  discoveryYearRange: [1990, 2025],
  colorMetric: "discoveryYear",
  autoRotate: true,
};

export const COLOR_METRIC_LABELS: Record<ColorMetric, string> = {
  discoveryYear: "Discovery year",
  radius: "Planet radius",
  mass: "Planet mass",
  distance: "System distance",
  method: "Detection method",
};
