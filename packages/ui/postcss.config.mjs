// Shared PostCSS config for Tailwind v4. Consuming apps re-export this
// (e.g. `export { default } from "@moonit/ui/postcss.config"`) so the
// design system and every app process Tailwind identically. See INFRASTRUCTURE.md §5.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
