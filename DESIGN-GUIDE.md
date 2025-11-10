# 🎨 Visual Design Guide - Project Networks

## Color Palette

### Primary Colors
```
Purple (Primary)     #db01f9  ██████
Blue (Secondary)     #0071f8  ██████
Cyan (Accent)        #00f5ff  ██████
```

### Background Colors
```
Dark Background      #0a0a0f  ██████
Surface              #12121a  ██████
Surface Alt          #1a1a24  ██████
Surface Elevated     #22222e  ██████
```

### Text Colors
```
White (Primary)      #ffffff  ██████
Muted (80%)         rgba(255,255,255,0.8)  ██████
Subtle (60%)        rgba(255,255,255,0.6)  ██████
Disabled (40%)      rgba(255,255,255,0.4)  ██████
```

## Typography

### Font Families
- **Display/Headings**: Poppins (600, 700, 800 weight)
- **Body Text**: Inter (300, 400, 500, 600 weight)

### Font Sizes (Desktop)
```
Hero Title (H1)      3.5rem (56px)
Section Title (H2)   2.5rem (40px)
Card Title (H3)      1.5rem (24px)
Large Text           1.25rem (20px)
Body Text            1rem (16px)
Small Text           0.875rem (14px)
```

## Component Styles

### Buttons

#### Primary Button
```
Background: Linear gradient (purple to blue)
Padding: 12px 28px
Border Radius: 12px
Font Weight: 600
Hover: Lift + glow effect
```

#### Outline Button
```
Background: Transparent
Border: 2px solid border color
Hover: Purple border + background tint
```

### Cards

#### Project Card
```
Background: Glass effect (3% white + blur)
Border: 1px subtle white
Border Radius: 16px
Padding: 24px
Hover: Lift 10px + scale 1.02 + purple glow
```

### Animations

#### Entrance Animations
- Fade In Up (hero content)
- Slide In Down (badges)
- Zoom In (CTA sections)

#### Hover Effects
- Cards: translateY(-10px) + scale(1.02)
- Buttons: translateY(-2px) + glow
- Links: Underline slide-in

#### Background Animations
- Gradient orbs: Float animation (20s)
- Pulse dots: 2s infinite pulse
- Scroll indicator: Bounce animation

## Spacing System

### Space Scale (8px base)
```
space-1   4px    (0.25rem)
space-2   8px    (0.5rem)
space-3   12px   (0.75rem)
space-4   16px   (1rem)
space-5   24px   (1.5rem)
space-6   32px   (2rem)
space-7   40px   (2.5rem)
space-8   48px   (3rem)
space-9   64px   (4rem)
space-10  80px   (5rem)
space-12  96px   (6rem)
space-16  128px  (8rem)
```

## Border Radius

```
Small     6px
Medium    12px
Large     16px
XLarge    24px
2XLarge   32px
Full      9999px (pill shape)
```

## Shadows & Effects

### Box Shadows
```
Small     0 2px 8px rgba(0,0,0,0.1)
Medium    0 4px 16px rgba(0,0,0,0.2)
Large     0 8px 32px rgba(0,0,0,0.3)
XLarge    0 16px 64px rgba(0,0,0,0.4)
```

### Glow Effects
```
Purple    0 0 30px rgba(219,1,249,0.3)
Blue      0 0 30px rgba(0,113,248,0.3)
```

### Backdrop Effects
```
Blur      blur(10px) or blur(20px)
Opacity   Background: rgba(10,10,15,0.8)
```

## Layout Grid

### Container
```
Max Width: 1200px
Padding: 24px (desktop), 16px (mobile)
Margin: 0 auto
```

### Grid Layouts
```
Project Cards: 
  Desktop: 3 columns
  Tablet: 2 columns
  Mobile: 1 column

Footer Grid:
  Desktop: 2fr 1fr 1fr 1.5fr
  Tablet: 2 columns
  Mobile: 1 column
```

## Responsive Breakpoints

```
Desktop     1200px+    Full features
Laptop      968px+     Adjusted layouts
Tablet      768px+     2-column grids
Mobile      < 768px    Stacked layout
```

## Icons

### Icon Library
- Using inline SVG icons
- Sizes: 16px, 20px, 24px, 32px, 40px
- Stroke width: 2px
- Style: Line icons (outline style)

### Icon Colors
- Default: currentColor
- Primary actions: Purple gradient
- Status: Green (#4ade80), Cyan (#00f5ff)

## Navigation

### Desktop Nav
```
Height: 80px
Background: Glass effect with blur
Border Bottom: 1px subtle white
Position: Fixed top
```

### Mobile Nav
```
Hamburger: 3 lines, 25px width
Menu: Slide from top
Backdrop: Dark overlay with blur
```

## Special Effects

### Glassmorphism Recipe
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### Gradient Background Recipe
```css
background: linear-gradient(135deg, #db01f9 0%, #0071f8 100%);
```

### Gradient Text Recipe
```css
background: linear-gradient(135deg, #db01f9 0%, #0071f8 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

## Accessibility

### Focus States
```
Outline: 2px solid purple
Offset: 2px
Visible on keyboard navigation
```

### ARIA Labels
- All interactive elements
- Navigation landmarks
- Button descriptions
- Image alt text

### Color Contrast
- Text on dark: White (21:1 ratio)
- Text on cards: 80% white (16:1 ratio)
- All text meets WCAG AA standards

## Motion & Animation

### Timing Functions
```
Fast      150ms cubic-bezier(0.4, 0, 0.2, 1)
Base      300ms cubic-bezier(0.4, 0, 0.2, 1)
Slow      500ms cubic-bezier(0.4, 0, 0.2, 1)
Bounce    600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

### Do's ✅
- Use gradient text for emphasis
- Add hover states to interactive elements
- Maintain consistent spacing
- Use semantic HTML
- Test on multiple devices
- Optimize images before upload

### Don'ts ❌
- Don't use too many colors
- Don't make buttons too small (<44px)
- Don't use complex animations on mobile
- Don't forget alt text
- Don't skip accessibility features

## Quick Copy-Paste Snippets

### Gradient Button
```css
background: linear-gradient(135deg, #db01f9 0%, #0071f8 100%);
padding: 12px 28px;
border-radius: 12px;
color: white;
font-weight: 600;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Glass Card
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
padding: 24px;
```

### Hover Lift Effect
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```
```css
:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

**Design System Version**: 1.0
**Last Updated**: November 2024
**Brand**: Project Networks
