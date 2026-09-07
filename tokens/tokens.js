/**
 * GenUI design tokens.
 *
 * `tokens.json` is the scanner-compatible source. Keep this runtime layer aligned
 * with the JSON and SCSS representations.
 */

export const designTokens = Object.freeze({
  color: {
    action: {
      primary: '#6C43C6',
      primaryHover: '#5F3BAE',
      primaryActive: '#563597',
      secondary: '#3571FE',
      danger: '#CC1730',
      dangerHover: '#B5142B',
    },
    text: {
      primary: '#161C27',
      secondary: '#5F5E60',
      muted: '#92908F',
      inverse: '#FFFFFF',
      disabled: 'rgba(22, 28, 39, 0.38)',
    },
    surface: {
      base: '#FFFFFF',
      subtle: '#F5F3F1',
      raised: '#FFFFFF',
      strong: '#E9E7E3',
      hover: '#EDEAE7',
      active: '#E4E1DD',
      inverse: '#161C27',
      scrim: 'rgba(0, 0, 0, 0.48)',
      glass: 'rgba(255, 255, 255, 0.72)',
    },
    border: {
      subtle: '#C6C4C0',
      strong: '#757775',
    },
    status: {
      info: '#3571FE',
      infoSurface: '#DCE7FF',
      success: '#1C8843',
      successSurface: '#C3F5C8',
      warning: '#8C6D00',
      warningSurface: '#FFE9A3',
      danger: '#CC1730',
      dangerSurface: '#FFD9DC',
    },
    focus: '#6C43C6',
  },
  type: {
    family: {
      base: "'Rookery New', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    },
    weight: { regular: 400, medium: 500, bold: 700 },
    style: {
      display: { fontSize: '40px', lineHeight: '48px', fontWeight: 700, letterSpacing: '-0.5px' },
      headingL: { fontSize: '32px', lineHeight: '40px', fontWeight: 700, letterSpacing: '-0.4px' },
      headingM: { fontSize: '28px', lineHeight: '36px', fontWeight: 700, letterSpacing: '-0.3px' },
      headingS: { fontSize: '22px', lineHeight: '28px', fontWeight: 700, letterSpacing: '-0.2px' },
      title: { fontSize: '18px', lineHeight: '24px', fontWeight: 500, letterSpacing: '0' },
      bodyL: { fontSize: '16px', lineHeight: '24px', fontWeight: 400, letterSpacing: '0.25px' },
      bodyM: { fontSize: '14px', lineHeight: '20px', fontWeight: 400, letterSpacing: '0.25px' },
      bodyS: { fontSize: '12px', lineHeight: '16px', fontWeight: 400, letterSpacing: '0.1px' },
      label: { fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0.1px' },
    },
  },
  spacing: { 0: '0px', 1: '2px', 2: '4px', 3: '8px', 4: '12px', 5: '16px', 6: '20px', 7: '24px', 8: '32px', 9: '40px', 10: '56px' },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '24px', pill: '9999px' },
  borderWidth: { thin: '1px', medium: '2px', thick: '3px' },
  elevation: {
    1: '0 1px 2px rgba(22, 28, 39, 0.04), 0 1px 3px rgba(22, 28, 39, 0.06)',
    2: '0 2px 4px rgba(22, 28, 39, 0.05), 0 4px 8px rgba(22, 28, 39, 0.06)',
    3: '0 4px 8px rgba(22, 28, 39, 0.06), 0 8px 16px rgba(22, 28, 39, 0.08)',
    focus: '0 0 0 3px rgba(108, 67, 198, 0.32)',
  },
  blur: { surface: '16px', prompt: '24px', window: '40px' },
  motion: {
    duration: { fast: '120ms', base: '200ms', slow: '320ms' },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
  layout: {
    breakpoint: { sm: '0px', md: '672px', lg: '1056px', xl: '1312px' },
    grid: {
      mobileColumns: 4,
      tabletColumns: 8,
      desktopColumns: 12,
      mobileGutter: '16px',
      tabletGutter: '24px',
      desktopGutter: '32px',
      maxContentWidth: '1584px',
    },
  },
  control: { height: { sm: '32px', md: '40px', lg: '48px' } },
  zIndex: { base: 0, raised: 10, sticky: 100, dropdown: 1000, overlay: 1200, modal: 1300, toast: 1400, tooltip: 1500 },
});

export const cssVariables = Object.freeze({
  '--gen-color-action-primary': designTokens.color.action.primary,
  '--gen-color-action-primary-hover': designTokens.color.action.primaryHover,
  '--gen-color-action-primary-active': designTokens.color.action.primaryActive,
  '--gen-color-action-secondary': designTokens.color.action.secondary,
  '--gen-color-action-danger': designTokens.color.action.danger,
  '--gen-color-text-primary': designTokens.color.text.primary,
  '--gen-color-text-secondary': designTokens.color.text.secondary,
  '--gen-color-text-muted': designTokens.color.text.muted,
  '--gen-color-text-inverse': designTokens.color.text.inverse,
  '--gen-color-text-disabled': designTokens.color.text.disabled,
  '--gen-color-surface-base': designTokens.color.surface.base,
  '--gen-color-surface-subtle': designTokens.color.surface.subtle,
  '--gen-color-surface-raised': designTokens.color.surface.raised,
  '--gen-color-surface-strong': designTokens.color.surface.strong,
  '--gen-color-surface-hover': designTokens.color.surface.hover,
  '--gen-color-surface-active': designTokens.color.surface.active,
  '--gen-color-surface-inverse': designTokens.color.surface.inverse,
  '--gen-color-surface-scrim': designTokens.color.surface.scrim,
  '--gen-color-surface-glass': designTokens.color.surface.glass,
  '--gen-color-border-subtle': designTokens.color.border.subtle,
  '--gen-color-border-strong': designTokens.color.border.strong,
  '--gen-color-status-info': designTokens.color.status.info,
  '--gen-color-status-info-surface': designTokens.color.status.infoSurface,
  '--gen-color-status-success': designTokens.color.status.success,
  '--gen-color-status-success-surface': designTokens.color.status.successSurface,
  '--gen-color-status-warning': designTokens.color.status.warning,
  '--gen-color-status-warning-surface': designTokens.color.status.warningSurface,
  '--gen-color-status-danger': designTokens.color.status.danger,
  '--gen-color-status-danger-surface': designTokens.color.status.dangerSurface,
  '--gen-color-focus': designTokens.color.focus,
  '--gen-font-family-base': designTokens.type.family.base,
  '--gen-font-family-mono': designTokens.type.family.mono,
  '--gen-radius-sm': designTokens.radius.sm,
  '--gen-radius-md': designTokens.radius.md,
  '--gen-radius-lg': designTokens.radius.lg,
  '--gen-radius-xl': designTokens.radius.xl,
  '--gen-radius-pill': designTokens.radius.pill,
  '--gen-control-height-sm': designTokens.control.height.sm,
  '--gen-control-height-md': designTokens.control.height.md,
  '--gen-control-height-lg': designTokens.control.height.lg,
  '--gen-motion-fast': designTokens.motion.duration.fast,
  '--gen-motion-base': designTokens.motion.duration.base,
  '--gen-motion-slow': designTokens.motion.duration.slow,
  '--gen-ease-standard': designTokens.motion.easing.standard,
  '--gen-ease-out': designTokens.motion.easing.out,
  '--gen-shadow-1': designTokens.elevation[1],
  '--gen-shadow-2': designTokens.elevation[2],
  '--gen-shadow-3': designTokens.elevation[3],
  '--gen-shadow-focus': designTokens.elevation.focus,
});

export const darkTheme = Object.freeze({
  '--gen-color-text-primary': '#F5F3F1',
  '--gen-color-text-secondary': '#C6C4C0',
  '--gen-color-text-muted': '#92908F',
  '--gen-color-text-inverse': '#161C27',
  '--gen-color-surface-base': '#161C27',
  '--gen-color-surface-subtle': '#202733',
  '--gen-color-surface-raised': '#252D3A',
  '--gen-color-surface-strong': '#303947',
  '--gen-color-surface-hover': '#2B3442',
  '--gen-color-surface-active': '#364050',
  '--gen-color-border-subtle': '#4C5665',
  '--gen-color-border-strong': '#7C8795',
});

export function applyTheme(target = document.documentElement, overrides = {}) {
  const theme = { ...cssVariables, ...overrides };
  Object.entries(theme).forEach(([name, value]) => target.style.setProperty(name, String(value)));
  return target;
}

export function getToken(path) {
  return path.split('.').reduce((value, key) => value?.[key], designTokens);
}
