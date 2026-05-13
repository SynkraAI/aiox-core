# aiox-core compatibility package

`aiox-core` is the legacy npm package name for AIOX Core.

The canonical package is now `@aiox-squads/core`. This compatibility package
keeps existing commands such as `npx aiox-core@latest install` working by
delegating to the canonical package.

Recommended new command:

```bash
npx -y -p @aiox-squads/core@latest aiox install
```
