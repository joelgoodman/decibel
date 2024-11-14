export interface Theme {
  name: string;
  version: string;
  template: string;
  partials: Record<string, string>;
  assets: {
    styles: string[];
    scripts: string[];
    images: Record<string, string>;
  };
  helpers?: Record<string, Function>;
  config: ThemeConfig;
}

export interface ThemeConfig {
  contentZones: ContentZone[];
  customization: {
    colors: ColorConfig[];
    typography: TypographyConfig;
    spacing: SpacingConfig;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ContentZone {
  id: string;
  name: string;
  description: string;
  allowedBlocks?: string[];
  maxItems?: number;
}

export interface ColorConfig {
  id: string;
  label: string;
  default: string;
  variable: string;
}

export interface TypographyConfig {
  fontFamilies: {
    body: string[];
    heading: string[];
    mono: string[];
  };
  fontSizes: Record<string, string>;
  lineHeights: Record<string, number>;
}

export interface SpacingConfig {
  scale: Record<string, string>;
  containers: Record<string, string>;
}

export interface ThemeContext {
  theme: {
    name: string;
    version: string;
    assets: Theme['assets'];
  };
  data: Record<string, any>;
  helpers: Record<string, Function>;
}