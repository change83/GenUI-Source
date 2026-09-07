# Design.md — ustwo/basic-web

Generated 2026-08-28 by reading the JSON in this repository’s tokens folder on develop.
That JSON is the Figma export: no hand-typed values, and no second source to reconcile against.
Component definitions live in Components.md; the two files are independent.

- Token files read: 1 (tokens.json → 147)
- Values: 147 · unique names: 147
- Modes published: base
- Slot resolution uses: base
- Alias references resolved to a literal: 0
- Values skipped as not visual: 0 (booleans and composite objects)

## Colour

Source: repo tokens folder · 57 properties

- `color/hex/colorBackgroundBlurScrim` — #0000001F
- `color/hex/colorError` — #CC1730
- `color/hex/colorErrorContainer` — #FFD9DC
- `color/hex/colorErrorHover` — #B5142B
- `color/hex/colorErrorPressed` — #A11225
- `color/hex/colorFocus` — #161C27
- `color/hex/colorFocusContainer` — #F1EEEB
- `color/hex/colorInverseOnSurface` — #F5F3F1
- `color/hex/colorInverseSurface` — #161C27
- `color/hex/colorOnError` — #FFFFFF
- `color/hex/colorOnErrorContainer` — #410008
- `color/hex/colorOnFocus` — #FFFFFF
- `color/hex/colorOnFocusContainer` — #161C27
- `color/hex/colorOnPrimary` — #FFFFFF
- `color/hex/colorOnPrimaryContainer` — #210A47
- `color/hex/colorOnSecondary` — #FFFFFF
- `color/hex/colorOnSecondaryContainer` — #001945
- `color/hex/colorOnSuccess` — #FFFFFF
- `color/hex/colorOnSuccessContainer` — #00210F
- `color/hex/colorOnSurface` — #161C27
- `color/hex/colorOnSurfaceDisabled` — #0000004D
- `color/hex/colorOnSurfaceMuted` — #92908F
- `color/hex/colorOnSurfaceVariant` — #5F5E60
- `color/hex/colorOnTertiary` — #FFFFFF
- `color/hex/colorOnTertiaryContainer` — #410008
- `color/hex/colorOnWarning` — #FFFFFF
- `color/hex/colorOnWarningContainer` — #271900
- `color/hex/colorOutline` — #757775
- `color/hex/colorOutlineInverse` — #FFFFFF
- `color/hex/colorOutlineVariant` — #C6C4C0
- `color/hex/colorPrimary` — #6C43C6
- `color/hex/colorPrimaryContainer` — #E9DDFF
- `color/hex/colorPrimaryContainerHover` — #DFD0FA
- `color/hex/colorPrimaryContainerPressed` — #D6C4F7
- `color/hex/colorPrimaryHover` — #5F3BAE
- `color/hex/colorPrimaryPressed` — #563597
- `color/hex/colorScrim` — #0000004D
- `color/hex/colorScrimHeavy` — #00000099
- `color/hex/colorSecondary` — #3571FE
- `color/hex/colorSecondaryContainer` — #DCE7FF
- `color/hex/colorStateHover` — #0000001F
- `color/hex/colorStatePressed` — #00000029
- `color/hex/colorSuccess` — #1C8843
- `color/hex/colorSuccessContainer` — #C3F5C8
- `color/hex/colorSurface` — #FFFFFF
- `color/hex/colorSurfaceBlur` — #FFFFFF99
- `color/hex/colorSurfaceBlurHigh` — #FFFFFFCC
- `color/hex/colorSurfaceBlurLow` — #FFFFFF4D
- `color/hex/colorSurfaceContainer` — #F5F3F1
- `color/hex/colorSurfaceContainerHighest` — #E9E7E3
- `color/hex/colorSurfaceContainerHover` — #EDEAE7
- `color/hex/colorSurfaceContainerPressed` — #E4E1DD
- `color/hex/colorSurfaceDisabled` — #0000001F
- `color/hex/colorTertiary` — #FB575F
- `color/hex/colorTertiaryContainer` — #FFD9D8
- `color/hex/colorWarning` — #8C6D00
- `color/hex/colorWarningContainer` — #FFE9A3

## Typography

Source: repo tokens folder · 43 properties

- `typography/font/bodyL` — 400 16px/24px var(--font-family-base)
- `typography/font/bodyLBold` — 700 16px/24px var(--font-family-base)
- `typography/font/bodyLMedium` — 500 16px/24px var(--font-family-base)
- `typography/font/bodyM` — 400 14px/20px var(--font-family-base)
- `typography/font/bodyMBold` — 700 14px/20px var(--font-family-base)
- `typography/font/bodyMMedium` — 500 14px/20px var(--font-family-base)
- `typography/font/bodyS` — 400 12px/16px var(--font-family-base)
- `typography/font/bodySBold` — 700 12px/16px var(--font-family-base)
- `typography/font/bodySMedium` — 500 12px/16px var(--font-family-base)
- `typography/font/bodyXs` — 400 11px/16px var(--font-family-base)
- `typography/font/displayL` — 700 48px/56px var(--font-family-base)
- `typography/font/displayM` — 700 44px/52px var(--font-family-base)
- `typography/font/displayS` — 700 40px/48px var(--font-family-base)
- `typography/font/displayXl` — 700 52px/60px var(--font-family-base)
- `typography/font/displayXs` — 700 36px/44px var(--font-family-base)
- `typography/font/fontFamilyBase` — 'Rookery New', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif
- `typography/font/fontFamilyMono` — ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace
- `typography/font/headlineL` — 700 32px/40px var(--font-family-base)
- `typography/font/headlineM` — 700 28px/36px var(--font-family-base)
- `typography/font/headlineS` — 700 22px/28px var(--font-family-base)
- `typography/font/labelL` — 500 16px/24px var(--font-family-base)
- `typography/font/labelM` — 500 14px/20px var(--font-family-base)
- `typography/font/labelS` — 500 12px/16px var(--font-family-base)
- `typography/font/labelXs` — 500 11px/16px var(--font-family-base)
- `typography/font/titleL` — 500 20px/28px var(--font-family-base)
- `typography/font/titleM` — 500 18px/24px var(--font-family-base)
- `typography/font/titleS` — 500 16px/20px var(--font-family-base)
- `typography/font/titleXl` — 500 24px/32px var(--font-family-base)
- `typography/font/titleXs` — 500 14px/18px var(--font-family-base)
- `typography/font/trackingBodyL` — 0.25px
- `typography/font/trackingBodyM` — 0.25px
- `typography/font/trackingBodyS` — 0.1px
- `typography/font/trackingDisplay` — -0.5px
- `typography/font/trackingHeadlineL` — -0.4px
- `typography/font/trackingLabelL` — 0.1px
- `typography/font/trackingLabelM` — 0.1px
- `typography/font/trackingLabelS` — 0.25px
- `typography/font/trackingLabelXs` — 0.5px
- `typography/font/trackingTitleM` — 0.15px
- `typography/font/trackingTitleS` — 0.1px
- `typography/font/weightBold` — 700
- `typography/font/weightMedium` — 500
- `typography/font/weightRegular` — 400

## Effects

Source: repo tokens folder · 17 properties

- `blur/pX/blurPromptBar` — 24px
  - categorised by hand
- `blur/pX/blurSurface` — 16px
  - categorised by hand
- `blur/pX/blurWindow` — 40px
  - categorised by hand
- `borderWidth/pX/borderMedium` — 2
  - categorised by hand
- `borderWidth/pX/borderThick` — 3
  - categorised by hand
- `borderWidth/pX/borderThin` — 1
  - categorised by hand
- `opacity/n/opacityDisabled` — 0.38
  - categorised by hand
- `opacity/n/opacityFull` — 1
  - categorised by hand
- `opacity/n/opacityMuted` — 0.75
  - categorised by hand
- `opacity/n/opacitySubtle` — 0.6
  - categorised by hand
- `shadow/css/elevation1` — 0 1px 2px rgba(22, 28, 39, 0.04), 0 1px 3px rgba(22, 28, 39, 0.06)
- `shadow/css/elevation2` — 0 2px 4px rgba(22, 28, 39, 0.05), 0 4px 8px rgba(22, 28, 39, 0.06)
- `shadow/css/elevation3` — 0 4px 8px rgba(22, 28, 39, 0.06), 0 8px 16px rgba(22, 28, 39, 0.08)
- `shadow/css/elevation4` — 0 8px 16px rgba(22, 28, 39, 0.07), 0 16px 32px rgba(22, 28, 39, 0.10)
- `shadow/css/elevation5` — 0 12px 24px rgba(22, 28, 39, 0.08), 0 24px 48px rgba(22, 28, 39, 0.14)
- `shadow/css/elevationBottom` — 0 -1px 3px rgba(22, 28, 39, 0.05)
- `shadow/css/shadowFocus` — 0 0 0 3px rgba(108, 67, 198, 0.32)

## Spacing

Source: repo tokens folder · 11 properties

- `spacing/pX/spacing0` — 0px
- `spacing/pX/spacing1` — 2px
- `spacing/pX/spacing10` — 56px
- `spacing/pX/spacing2` — 4px
- `spacing/pX/spacing3` — 8px
- `spacing/pX/spacing4` — 12px
- `spacing/pX/spacing5` — 16px
- `spacing/pX/spacing6` — 20px
- `spacing/pX/spacing7` — 24px
- `spacing/pX/spacing8` — 32px
- `spacing/pX/spacing9` — 40px

## Radius

Source: repo tokens folder · 5 properties

- `radius/pX/radiusLg` — 16px
- `radius/pX/radiusMd` — 12px
- `radius/pX/radiusPill` — 9999px
- `radius/pX/radiusSm` — 8px
- `radius/pX/radiusXl` — 24px

## Motion

Source: repo tokens folder · 6 properties

- `motion/css/durationBase` — 200ms
- `motion/css/durationFast` — 120ms
- `motion/css/durationSlow` — 320ms
- `motion/css/easeOut` — cubic-bezier(0, 0, 0.2, 1)
- `motion/css/easeSpring` — cubic-bezier(0.34, 1.56, 0.64, 1)
- `motion/css/easeStandard` — cubic-bezier(0.4, 0, 0.2, 1)

## Z-index

Source: repo tokens folder · 8 properties

- `zIndex/n/zBase` — 0
- `zIndex/n/zDropdown` — 1000
- `zIndex/n/zModal` — 1300
- `zIndex/n/zOverlay` — 1200
- `zIndex/n/zRaised` — 10
- `zIndex/n/zSticky` — 100
- `zIndex/n/zToast` — 1400
- `zIndex/n/zTooltip` — 1500
