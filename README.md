# PF2E Affliction Forge: The Black Archive

A bilingual DE/EN prestige library add-on for **PF2E Affliction Forge 0.1.63+**. It contains 24 deliberately unusual afflictions that exercise the deeper runtime features of the Affliction Forge rather than simply adding another broad content pool.


## Part of the Forge Suite

**Affliction Forge: The Black Archive** is part of the **Forge Suite**, a growing collection of Foundry VTT modules and add-ons built for the busy Game Master. The suite is designed to reduce preparation and bookkeeping, make common GM tasks easier, and add useful tools that help make running and playing campaigns smoother and more enjoyable.

An overview of the Forge Suite, its modules, add-ons, and shared documentation is available here:

**Forge Suite:** https://github.com/crypto-vbrthr/pf2e-forge-suite


## Feedback, Bug Reports & Feature Requests

Found a bug, have an idea for an improvement, or would like to suggest a new feature?

Feedback is always welcome. Please feel free to open a new **GitHub Issue** at any time, whether you want to report a problem, suggest a quality-of-life improvement, propose a new feature, or share an idea for how the module could be made more useful.

When reporting a bug, please include as much relevant information as possible, such as the Foundry VTT version, PF2e system version, module version, steps to reproduce the issue, and any console errors or screenshots that may help identify the problem.

Suggestions and feature requests are equally welcome. Even small ideas can lead to useful improvements.

**Open an issue here:** https://github.com/crypto-vbrthr/pf2e-affliction-forge-black-archive/issues


## Highlights

- 24 original rare/unique afflictions from level 1 to 20
- Diseases, poisons, and curses
- Periodic stage effects
- Event reactions for damage taken, condition increases, initiative, and turn starts
- Timed residual component persistence beyond a stage
- Alternative stage expiry actions (`stay`, `end`)
- Numeric phase modifiers
- Concentration gates, speech blocking, healing restrictions, condition locks, Virulent and stubborn progression
- One true weapon injury poison using the existing coating/charge workflow
- A unique level-20 finale with a death-effect stage
- Canonical semantic Creature Forge tags
- Foundry 14-safe managed world-compendium synchronization

## Design boundary

The library intentionally uses only mechanics already present in Affliction Forge schema v2 / contract 0.1.63. It does not fake calendar triggers, nightly progression, or delayed reactivation after full recovery. Those would require future engine support rather than library-only data.

## Development tests

```bash
npm test
```

The tests locate Affliction Forge by its `module.json` id in a sibling folder. For a non-standard development layout, set `PF2E_AFFLICTION_FORGE_PATH` to the core module directory.
