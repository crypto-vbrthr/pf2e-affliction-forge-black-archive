# PF2E Affliction Forge: The Black Archive

A bilingual DE/EN prestige library add-on for **PF2E Affliction Forge 0.1.63+**. It contains 24 deliberately unusual afflictions that exercise the deeper runtime features of the Affliction Forge rather than simply adding another broad content pool.

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
