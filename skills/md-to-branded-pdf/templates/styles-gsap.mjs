/**
 * Minimal CSS for GSAP mode that Tailwind CDN can't handle.
 * Includes shadcn CSS variables, loading screen, cursor glow, scrollbar, etc.
 */

/**
 * Get CSS string for GSAP mode.
 * @param {string} shadcnVars - CSS custom properties from brandToShadcnVars
 * @returns {string} Complete CSS string
 */
export function getGSAPCSS(shadcnVars) {
  return `
/* shadcn CSS variables for dark theme */
:root {
${shadcnVars}
}

/* Light theme overrides (invert lightness) */
[data-theme="light"] {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 259 69% 56%;
  --primary-light: 259 69% 70%;
  --primary-foreground: 0 0% 98%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;
  --ring: 259 69% 56%;
}

/* Loading screen styles */
#loading-screen {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

#loading-screen .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Cursor glow */
#cursor-glow {
  position: fixed;
  width: 400px;
  height: 400px;
  pointer-events: none;
  z-index: 9999;
  background: radial-gradient(circle, hsla(var(--primary), 0.15) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
}

/* Magnetic buttons */
.magnetic-btn {
  transition: transform 0.2s ease-out;
  cursor: pointer;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--background));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--primary) / 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary));
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Text selection color */
::selection {
  background: hsl(var(--primary) / 0.3);
  color: hsl(var(--foreground));
}

/* Highlight spans in titles */
.highlight,
h1 .highlight,
h2 .highlight {
  color: hsl(var(--primary));
  position: relative;
  font-weight: 800;
}

/* Nav link active state */
.nav-link.active {
  color: hsl(var(--primary)) !important;
  font-weight: 600;
}

/* Table base styles (Tailwind handles most) */
table {
  width: 100%;
  border-collapse: collapse;
}

table thead {
  background: hsl(var(--card));
  border-bottom: 2px solid hsl(var(--border));
}

table th,
table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid hsl(var(--border));
}

table th {
  font-weight: 600;
  color: hsl(var(--foreground));
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

table td {
  color: hsl(var(--muted-foreground));
}

table tbody tr:hover {
  background: hsl(var(--accent) / 0.5);
}

/* Pricing table specific */
table.pricing-table .discount {
  color: hsl(var(--primary));
  font-weight: 700;
}

/* Compare table specific */
table.compare-table .yes {
  color: #22c55e;
  font-weight: 600;
}

table.compare-table .no {
  color: #ef4444;
  font-weight: 600;
}

table.compare-table .partial {
  color: #f59e0b;
  font-weight: 600;
}

/* Code block dark override */
pre {
  background: hsl(var(--card)) !important;
  border: 1px solid hsl(var(--border));
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.7;
}

code {
  font-family: 'Fira Code', 'Courier New', monospace;
  color: hsl(var(--foreground));
}

/* ---- Phase 4: Premium Visual Effects ---- */

/* Gradient text on headings */
.gradient-text {
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animated gradient text */
.gradient-text-animated {
  background: linear-gradient(270deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Glow cards with shimmer border */
.glow-card {
  position: relative;
  overflow: hidden;
}

.glow-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.5), transparent, hsl(var(--accent) / 0.5));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: glowRotate 3s linear infinite;
}

@keyframes glowRotate {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* Mesh background */
.mesh-bg {
  position: relative;
}

.mesh-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, hsl(var(--primary) / 0.15), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 20%, hsl(var(--accent) / 0.10), transparent 60%),
    radial-gradient(ellipse 50% 60% at 60% 80%, hsl(var(--primary) / 0.08), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

/* Grid pattern overlay */
.grid-pattern {
  position: relative;
}

.grid-pattern::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%);
}

/* Floating decorative elements */
.floating-element {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.4;
  pointer-events: none;
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(2) {
  animation-delay: -2s;
  animation-duration: 8s;
}

.floating-element:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 7s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-15px) rotate(3deg); }
  66% { transform: translateY(10px) rotate(-2deg); }
}

/* Typewriter cursor */
.typewriter-cursor::after {
  content: '|';
  animation: blink 1s step-end infinite;
  color: hsl(var(--primary));
  font-weight: 300;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Spotlight cursor effect */
#spotlight-cursor {
  position: fixed;
  width: 600px;
  height: 600px;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
}

/* Shimmer border animation */
.shimmer-border {
  position: relative;
  overflow: hidden;
}

.shimmer-border::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(var(--primary) / 0.4) 25%,
    hsl(var(--accent) / 0.4) 50%,
    hsl(var(--primary) / 0.4) 75%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2.5s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 2px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Glassmorphism cards */
.glass-card {
  background: hsl(var(--card) / 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid hsl(var(--border) / 0.5);
  box-shadow: 0 8px 32px hsl(var(--primary) / 0.05);
}

/* Print media query */
@media print {
  #loading-screen,
  #cursor-glow,
  nav,
  .back-to-top {
    display: none !important;
  }

  body {
    background: white;
    color: black;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
}
