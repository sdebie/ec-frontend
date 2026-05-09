# Refactor findings

🟢 **Surface token naming convention: --sf-bg (short), set by StorefrontThemeProvider**  
Logged: Phase D / token-mismatch fix  
Files: `src/primitives/surface/tokens.css`, `src/context/StorefrontThemeProvider.tsx`  
**Convention.** Storefront surface tokens use short names (`--sf-bg`, `--sf-text`, `--sf-panel`, etc.) — NOT long names like `--sf-background`. `tokens.css` consumes them; `StorefrontThemeProvider` is the sole injection site. When adding a new theme variable, add it in the provider AND in `tokens.css`'s `[data-surface='storefront']` mapping with matching names.  
**Resolution.** Renamed two stale `--sf-background` references in `tokens.css` to `--sf-bg`.
