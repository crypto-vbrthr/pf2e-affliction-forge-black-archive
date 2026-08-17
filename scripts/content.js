const MODULE_ID = "pf2e-affliction-forge-black-archive";
const CONTENT_VERSION = "0.1.0";
const I18N_PREFIX = "PF2E_AFFLICTION_BA.Content";

const token=(slug,key)=>`@i18n:${I18N_PREFIX}.${slug}.${key}`;
const restrictions=({locks=[],healing="none",blocked=[]}={})=>({conditionLocks:locks.map(([slug,minimum])=>({slug,minimum})),healing,unhealableDamageTypes:[],blockedCapabilities:[...blocked]});
const duration=([value,unit])=>({value,unit});
const condition=(slug,value=null)=>value==null?{type:"condition",slug}:{type:"condition",slug,value};
const damage=(formula,damageType,persistent=false)=>({type:"damage",formula,damageType,...(persistent?{persistent:true}:{})});
const death=()=>({type:"death",category:"death-effect"});
function componentFromSpec(e){if(e[0]==="condition")return condition(e[1],e[2]);if(e[0]==="damage")return damage(e[1],e[2]);if(e[0]==="damagePersistent")return damage(e[1],e[2],true);if(e[0]==="death")return death();throw new Error(`Unsupported Black Archive component type: ${e[0]}`);}
function runtimeEffect(slug,key,componentSpecs){const components=(componentSpecs??[]).map(componentFromSpec);if(!components.length)return null;return{schemaVersion:2,id:`${MODULE_ID}.${slug}.${key}`,name:token(slug,key),duration:{value:-1,unit:"unlimited",expiry:null},components,application:{},metadata:{originModule:MODULE_ID,originFeature:"black-archive-runtime"}};}
function makeStage(slug,n,s){const [dur,componentSpecs,o={}]=s;const components=componentSpecs.map(componentFromSpec);const mods=(o.modifiers??[]).map((m,i)=>({id:m.id??`modifier-${i+1}`,label:token(slug,`Stage${n}.Modifier${i+1}`),selectors:m.selectors,type:m.type??"status",value:m.value}));const periodics=(o.periodics??[]).map((p,i)=>({id:p.id??`periodic-${i+1}`,label:token(slug,`Stage${n}.Periodic${i+1}`),interval:duration(p.interval),effect:runtimeEffect(slug,`Stage${n}.Periodic${i+1}Effect`,p.components)}));const reactions=(o.reactions??[]).map((r,i)=>({id:r.id??`reaction-${i+1}`,label:token(slug,`Stage${n}.Reaction${i+1}`),trigger:{event:r.event,damageTypes:r.damageTypes??[],conditionSlugs:r.conditionSlugs??[]},checkId:r.checked===false?null:"primary",applyOn:r.checked===false?[]:(r.applyOn??["failure","criticalFailure"]),conditionValueDelta:r.delta??0,controllerActions:r.actions??{criticalSuccess:"none",success:"none",failure:"none",criticalFailure:"none"},effect:runtimeEffect(slug,`Stage${n}.Reaction${i+1}Effect`,r.components)}));const gates=o.gate?[{id:`${slug}.stage-${n}.gate`,label:token(slug,`Stage${n}.Gate`),trigger:{actionKinds:["spell-cast","item-activation"],requiredTraits:["concentrate"]},check:{kind:"flat",dc:o.gate},blockOnFailure:true}]:[];return{id:`stage-${n}`,number:n,name:token(slug,`Stage${n}.Name`),description:token(slug,`Stage${n}.Description`),duration:duration(dur),expiryAction:o.expiry??"check",check:null,restrictions:restrictions({locks:o.locks??[],healing:o.healing??"none",blocked:o.blockSpeak?["speak"]:[]}),effectPersistence:o.persistence??"stage",effectPersistenceDuration:o.persistence==="timed"&&o.persistenceDuration?duration(o.persistenceDuration):null,effectComponentPersistence:Array.from({length:components.length},(_,i)=>o.componentPersistence?.[i]??null),effectComponentPersistenceDurations:Array.from({length:components.length},(_,i)=>o.componentPersistence?.[i]==="timed"&&o.componentDurations?.[i]?duration(o.componentDurations[i]):null),effect:runtimeEffect(slug,`Stage${n}.Name`,componentSpecs),numericModifiers:mods,periodicEffects:periodics,preActionGates:gates,reactions};}
function makeDefinition(s){const themes=Object.entries(s.tags).flatMap(([ns,vals])=>vals.map(v=>`${ns}:${v}`));const normal={criticalSuccess:{action:"stage-delta",delta:-2},success:{action:"stage-delta",delta:-1},failure:{action:"stage-delta",delta:1},criticalFailure:{action:"stage-delta",delta:2}};const stubborn={criticalSuccess:{action:"stage-delta",delta:-1},success:{action:"stay"},failure:{action:"stage-delta",delta:1},criticalFailure:{action:"stage-delta",delta:2}};return{schemaVersion:2,id:`${MODULE_ID}.${s.slug}`,name:token(s.slug,"Name"),description:token(s.slug,"Description"),img:"icons/svg/eye.svg",afflictionType:s.type,level:s.level,rarity:s.rarity,traits:[s.type,...(s.virulent?["virulent"]:[])],themes,saveDefaults:{execution:"player",visibility:"public"},identification:{initialState:s.identification??"identified"},delivery:{injuryPoison:s.injuryPoison===true},multipleExposure:"default",restrictions:restrictions({locks:s.locks??[],healing:s.rootHealing??"none"}),checks:[{id:"primary",label:token(s.slug,"SaveLabel"),kind:"save",statistic:s.stat,dcMode:"fixed",dc:s.dc,policy:null}],initialCheck:{checkIds:["primary"],combine:"single",outcomes:{criticalSuccess:{action:"reject"},success:{action:"reject"},failure:{action:"set-stage",stage:1},criticalFailure:{action:"set-stage",stage:Math.min(2,s.stages.length)}}},onset:s.onset?duration(s.onset):null,maximumDuration:s.maxDuration?duration(s.maxDuration):null,defaultStageCheck:{checkIds:["primary"],combine:"single",outcomes:s.stubborn?stubborn:normal},progression:{belowStageOne:"recover",aboveMaximumStage:"clamp",virulent:s.virulent===true},stages:s.stages.map((st,i)=>makeStage(s.slug,i+1,st)),metadata:{originModule:MODULE_ID,originFeature:"black-archive-library",contentVersion:CONTENT_VERSION,contentLicense:"original-homebrew",creatureForgeReady:true,prestigeLibrary:true}};}
const SPECS=[
  {
    "slug": "ink-between-names",
    "level": 1,
    "dc": 15,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "humanoid",
        "spirit"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "curse",
        "mental"
      ],
      "origin": [
        "occult"
      ],
      "delivery": [
        "contact",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "blockSpeak": true
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "1d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "gate": 5
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "second-shadow",
    "level": 2,
    "dc": 16,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "humanoid",
        "spirit"
      ],
      "habitat": [
        "urban",
        "underground"
      ],
      "theme": [
        "curse",
        "shadow",
        "mental"
      ],
      "origin": [
        "occult"
      ],
      "delivery": [
        "aura",
        "ability"
      ]
    },
    "stages": [
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "condition",
            "frightened",
            1
          ]
        ],
        {}
      ],
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "condition",
            "frightened",
            1
          ]
        ],
        {
          "reactions": [
            {
              "id": "shadow-turn",
              "event": "turn-start",
              "components": [
                [
                  "damage",
                  "1d4",
                  "mental"
                ]
              ],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ],
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "damage",
            "1d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "reactions": [
            {
              "id": "shadow-turn",
              "event": "turn-start",
              "components": [
                [
                  "damage",
                  "1d6",
                  "mental"
                ],
                [
                  "condition",
                  "frightened",
                  1
                ]
              ],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "hours"
    ],
    "stubborn": false,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "red-thread-parasite",
    "level": 3,
    "dc": 18,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "underground",
        "urban"
      ],
      "theme": [
        "disease",
        "parasite",
        "blood"
      ],
      "origin": [
        "occult",
        "natural"
      ],
      "delivery": [
        "injury",
        "contact"
      ],
      "family": [
        "worm"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "sickened",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "periodics": [
            {
              "id": "thread-bleed",
              "interval": [
                10,
                "minutes"
              ],
              "components": [
                [
                  "damagePersistent",
                  "1d4",
                  "bleed"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "1d6",
            "mental"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "periodics": [
            {
              "id": "thread-bleed",
              "interval": [
                10,
                "minutes"
              ],
              "components": [
                [
                  "damagePersistent",
                  "1d6",
                  "bleed"
                ]
              ]
            }
          ]
        }
      ]
    ],
    "onset": [
      10,
      "minutes"
    ],
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": true,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "glass-choir-dust",
    "level": 4,
    "dc": 19,
    "type": "poison",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "construct",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "poison",
        "mental",
        "toxin"
      ],
      "origin": [
        "arcane",
        "alchemical"
      ],
      "delivery": [
        "inhaled"
      ]
    },
    "stages": [
      [
        [
          1,
          "minutes"
        ],
        [
          [
            "condition",
            "dazzled"
          ]
        ],
        {}
      ],
      [
        [
          1,
          "minutes"
        ],
        [
          [
            "damage",
            "1d6",
            "mental"
          ],
          [
            "condition",
            "dazzled"
          ]
        ],
        {
          "periodics": [
            {
              "id": "glass-chime",
              "interval": [
                1,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "1d4",
                  "mental"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "minutes"
        ],
        [
          [
            "damage",
            "2d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "gate": 5,
          "periodics": [
            {
              "id": "glass-chime",
              "interval": [
                1,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "1d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      10,
      "minutes"
    ],
    "stubborn": false,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "borrowed-face",
    "level": 5,
    "dc": 20,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "fey",
        "humanoid"
      ],
      "habitat": [
        "forest",
        "urban",
        "planar"
      ],
      "theme": [
        "curse",
        "mutation",
        "mental"
      ],
      "origin": [
        "occult",
        "magical"
      ],
      "delivery": [
        "contact",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "clumsy",
            1
          ],
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "componentPersistence": [
            "timed",
            "stage"
          ],
          "componentDurations": [
            [
              1,
              "days"
            ],
            null
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "expiry": "stay",
          "reactions": [
            {
              "id": "true-name",
              "event": "initiative-rolled",
              "components": [],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [],
              "actions": {
                "criticalSuccess": "recover",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      7,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "bell-under-skin",
    "level": 6,
    "dc": 22,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "underground"
      ],
      "theme": [
        "disease",
        "mental",
        "corruption"
      ],
      "origin": [
        "occult"
      ],
      "delivery": [
        "injury",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "sickened",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "2d6",
            "mental"
          ],
          [
            "condition",
            "sickened",
            1
          ]
        ],
        {
          "reactions": [
            {
              "id": "inner-bell",
              "event": "turn-start",
              "components": [
                [
                  "damage",
                  "1d6",
                  "mental"
                ]
              ],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "2d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "gate": 5,
          "reactions": [
            {
              "id": "inner-bell",
              "event": "turn-start",
              "components": [
                [
                  "damage",
                  "1d6",
                  "mental"
                ],
                [
                  "condition",
                  "frightened",
                  1
                ]
              ],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": [
      10,
      "minutes"
    ],
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": true,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "thirteenth-pulse",
    "level": 7,
    "dc": 23,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "undead",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "curse",
        "blood",
        "necrotic"
      ],
      "origin": [
        "undead",
        "occult"
      ],
      "delivery": [
        "injury",
        "ability"
      ]
    },
    "stages": [
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "condition",
            "drained",
            1
          ]
        ],
        {}
      ],
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "reactions": [
            {
              "id": "pain-pulse",
              "event": "damage-taken",
              "components": [
                [
                  "damage",
                  "2d6",
                  "void"
                ]
              ],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ],
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "damage",
            "2d6",
            "void"
          ],
          [
            "condition",
            "drained",
            2
          ]
        ],
        {
          "reactions": [
            {
              "id": "pain-pulse",
              "event": "damage-taken",
              "components": [
                [
                  "damage",
                  "2d6",
                  "void"
                ],
                [
                  "condition",
                  "doomed",
                  1
                ]
              ],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "hours"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "mirror-fever",
    "level": 8,
    "dc": 24,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "disease",
        "mental",
        "corruption"
      ],
      "origin": [
        "arcane",
        "occult"
      ],
      "delivery": [
        "aura",
        "contact"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "dazzled"
          ]
        ],
        {
          "modifiers": [
            {
              "id": "lagging-reflection",
              "value": -5,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ],
          [
            "condition",
            "dazzled"
          ]
        ],
        {
          "modifiers": [
            {
              "id": "lagging-reflection",
              "value": -5,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ],
          "componentPersistence": [
            "stage",
            "timed"
          ],
          "componentDurations": [
            null,
            [
              1,
              "hours"
            ]
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "2d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "modifiers": [
            {
              "id": "lagging-reflection",
              "value": -10,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ]
        }
      ]
    ],
    "onset": [
      10,
      "minutes"
    ],
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "eclipsed-blood",
    "level": 9,
    "dc": 26,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "undead",
        "humanoid"
      ],
      "habitat": [
        "planar",
        "underground"
      ],
      "theme": [
        "curse",
        "blood",
        "shadow"
      ],
      "origin": [
        "undead",
        "occult"
      ],
      "delivery": [
        "injury",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damagePersistent",
            "1d6",
            "bleed"
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damagePersistent",
            "1d6",
            "bleed"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "healing": "affliction-damage"
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "3d6",
            "void"
          ],
          [
            "damagePersistent",
            "1d6",
            "bleed"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "healing": "affliction-damage",
          "locks": [
            [
              "drained",
              1
            ]
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "last-door-pollen",
    "level": 10,
    "dc": 27,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "fungus",
        "fey"
      ],
      "habitat": [
        "forest",
        "planar"
      ],
      "theme": [
        "disease",
        "spores",
        "dream",
        "fungal"
      ],
      "origin": [
        "primal",
        "occult"
      ],
      "delivery": [
        "inhaled"
      ],
      "family": [
        "parasite"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "gate": 5,
          "periodics": [
            {
              "id": "door-dream",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "1d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "3d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "gate": 7,
          "periodics": [
            {
              "id": "door-dream",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ]
    ],
    "onset": [
      10,
      "minutes"
    ],
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": true,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "bone-clock",
    "level": 10,
    "dc": 27,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "construct",
        "undead"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "curse",
        "necrotic"
      ],
      "origin": [
        "arcane",
        "undead"
      ],
      "delivery": [
        "contact",
        "ability"
      ]
    },
    "stages": [
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "condition",
            "slowed",
            1
          ]
        ],
        {}
      ],
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "condition",
            "slowed",
            1
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "modifiers": [
            {
              "id": "bone-clock-step",
              "value": -5,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ]
        }
      ],
      [
        [
          10,
          "minutes"
        ],
        [
          [
            "condition",
            "slowed",
            2
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "expiry": "stay",
          "modifiers": [
            {
              "id": "bone-clock-step",
              "value": -10,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ],
          "reactions": [
            {
              "id": "clock-reset",
              "event": "turn-start",
              "components": [],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [],
              "actions": {
                "criticalSuccess": "recover",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "white-room-toxin",
    "level": 11,
    "dc": 28,
    "type": "poison",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "humanoid",
        "aberration"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "poison",
        "mental",
        "toxin"
      ],
      "origin": [
        "alchemical",
        "occult"
      ],
      "delivery": [
        "inhaled",
        "ingested"
      ]
    },
    "stages": [
      [
        [
          1,
          "minutes"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "minutes"
        ],
        [
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "gate": 7
        }
      ],
      [
        [
          1,
          "minutes"
        ],
        [
          [
            "damage",
            "4d6",
            "mental"
          ],
          [
            "condition",
            "slowed",
            1
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "gate": 9
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      10,
      "minutes"
    ],
    "stubborn": false,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "king-in-ashes-mark",
    "level": 12,
    "dc": 30,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "fiend",
        "humanoid"
      ],
      "habitat": [
        "volcanic",
        "planar"
      ],
      "theme": [
        "curse",
        "elemental",
        "corruption"
      ],
      "origin": [
        "divine",
        "occult"
      ],
      "delivery": [
        "contact",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "frightened",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "reactions": [
            {
              "id": "ash-fed",
              "event": "damage-taken",
              "components": [
                [
                  "damage",
                  "2d6",
                  "spirit"
                ]
              ],
              "damageTypes": [
                "fire"
              ],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "4d6",
            "fire"
          ],
          [
            "condition",
            "drained",
            1
          ],
          [
            "condition",
            "doomed",
            1
          ]
        ],
        {
          "reactions": [
            {
              "id": "ash-fed",
              "event": "damage-taken",
              "components": [
                [
                  "damage",
                  "3d6",
                  "spirit"
                ]
              ],
              "damageTypes": [
                "fire"
              ],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "dream-of-teeth",
    "level": 12,
    "dc": 30,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "planar",
        "urban"
      ],
      "theme": [
        "curse",
        "dream",
        "mental"
      ],
      "origin": [
        "occult"
      ],
      "delivery": [
        "aura",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "frightened",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "periodics": [
            {
              "id": "dream-bite",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "4d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "periodics": [
            {
              "id": "dream-bite",
              "interval": [
                10,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "mental"
                ]
              ]
            }
          ],
          "reactions": [
            {
              "id": "wake-screaming",
              "event": "turn-start",
              "components": [
                [
                  "condition",
                  "frightened",
                  1
                ]
              ],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [
                "failure",
                "criticalFailure"
              ],
              "actions": {
                "criticalSuccess": "none",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "null-spore",
    "level": 13,
    "dc": 31,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "fungus",
        "aberration"
      ],
      "habitat": [
        "underground",
        "planar"
      ],
      "theme": [
        "disease",
        "spores",
        "corruption",
        "fungal"
      ],
      "origin": [
        "occult",
        "planar"
      ],
      "delivery": [
        "inhaled"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "sickened",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "3d6",
            "void"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "healing": "affliction-damage",
          "periodics": [
            {
              "id": "null-bloom",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "1d6",
                  "void"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "4d6",
            "void"
          ],
          [
            "condition",
            "drained",
            2
          ]
        ],
        {
          "healing": "all",
          "periodics": [
            {
              "id": "null-bloom",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "void"
                ]
              ]
            }
          ]
        }
      ]
    ],
    "onset": [
      10,
      "minutes"
    ],
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": true,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "saints-empty-halo",
    "level": 14,
    "dc": 32,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "celestial",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "curse",
        "necrotic",
        "mental"
      ],
      "origin": [
        "divine"
      ],
      "delivery": [
        "aura",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "doomed",
            1
          ],
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "componentPersistence": [
            "timed",
            "stage"
          ],
          "componentDurations": [
            [
              1,
              "days"
            ],
            null
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "4d6",
            "spirit"
          ],
          [
            "condition",
            "doomed",
            2
          ]
        ],
        {
          "componentPersistence": [
            "timed",
            "stage"
          ],
          "componentDurations": [
            [
              1,
              "days"
            ],
            null
          ],
          "blockSpeak": true
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      2,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "archivists-worm",
    "level": 14,
    "dc": 32,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "underground"
      ],
      "theme": [
        "disease",
        "parasite",
        "mental"
      ],
      "origin": [
        "occult"
      ],
      "delivery": [
        "ingested",
        "contact"
      ],
      "family": [
        "worm"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "blockSpeak": true,
          "periodics": [
            {
              "id": "memory-feed",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "4d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "periodics": [
            {
              "id": "memory-feed",
              "interval": [
                10,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ]
    ],
    "onset": [
      10,
      "minutes"
    ],
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": true,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "starless-venom",
    "level": 15,
    "dc": 34,
    "type": "poison",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "planar",
        "underground"
      ],
      "theme": [
        "poison",
        "venom",
        "shadow"
      ],
      "origin": [
        "alchemical",
        "occult"
      ],
      "delivery": [
        "weapon",
        "injury"
      ]
    },
    "stages": [
      [
        [
          1,
          "rounds"
        ],
        [
          [
            "damage",
            "4d6",
            "poison"
          ]
        ],
        {}
      ],
      [
        [
          1,
          "rounds"
        ],
        [
          [
            "damage",
            "4d6",
            "void"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "rounds"
        ],
        [
          [
            "damage",
            "5d6",
            "void"
          ],
          [
            "damagePersistent",
            "1d6",
            "bleed"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {}
      ]
    ],
    "onset": null,
    "maxDuration": [
      6,
      "rounds"
    ],
    "stubborn": false,
    "virulent": false,
    "injuryPoison": true,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "second-death-oath",
    "level": 16,
    "dc": 35,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "undead",
        "spirit"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "curse",
        "necrotic"
      ],
      "origin": [
        "undead",
        "divine"
      ],
      "delivery": [
        "ability",
        "aura"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "doomed",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "doomed",
            1
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "reactions": [
            {
              "id": "defy-doom",
              "event": "condition-increased",
              "components": [],
              "damageTypes": [],
              "conditionSlugs": [
                "doomed"
              ],
              "checked": true,
              "applyOn": [
                "success",
                "criticalSuccess"
              ],
              "actions": {
                "criticalSuccess": "recover",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": -1
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "5d6",
            "void"
          ],
          [
            "condition",
            "doomed",
            2
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "locks": [
            [
              "doomed",
              1
            ]
          ],
          "reactions": [
            {
              "id": "defy-doom",
              "event": "condition-increased",
              "components": [],
              "damageTypes": [],
              "conditionSlugs": [
                "doomed"
              ],
              "checked": true,
              "applyOn": [
                "criticalSuccess"
              ],
              "actions": {
                "criticalSuccess": "recover",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": -1
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      2,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "memory-cairn",
    "level": 17,
    "dc": 36,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "spirit",
        "humanoid"
      ],
      "habitat": [
        "mountain",
        "planar"
      ],
      "theme": [
        "curse",
        "mental",
        "shadow"
      ],
      "origin": [
        "occult"
      ],
      "delivery": [
        "contact",
        "ability"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "modifiers": [
            {
              "id": "heavy-memory",
              "value": -5,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "modifiers": [
            {
              "id": "heavy-memory",
              "value": -10,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ],
          "componentPersistence": [
            "timed"
          ],
          "componentDurations": [
            [
              1,
              "days"
            ]
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "5d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "modifiers": [
            {
              "id": "heavy-memory",
              "value": -10,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      2,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "world-scar-fever",
    "level": 17,
    "dc": 36,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "planar",
        "volcanic"
      ],
      "theme": [
        "disease",
        "corruption",
        "blood"
      ],
      "origin": [
        "planar",
        "occult"
      ],
      "delivery": [
        "aura",
        "injury"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "sickened",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "4d6",
            "spirit"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "periodics": [
            {
              "id": "scar-pulse",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "spirit"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "5d6",
            "spirit"
          ],
          [
            "condition",
            "drained",
            2
          ]
        ],
        {
          "healing": "affliction-damage",
          "periodics": [
            {
              "id": "scar-pulse",
              "interval": [
                10,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "spirit"
                ]
              ]
            }
          ]
        }
      ]
    ],
    "onset": [
      10,
      "minutes"
    ],
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": true,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "black-sun-contagion",
    "level": 18,
    "dc": 38,
    "type": "disease",
    "rarity": "rare",
    "stat": "fortitude",
    "tags": {
      "creature": [
        "undead",
        "aberration"
      ],
      "habitat": [
        "planar",
        "underground"
      ],
      "theme": [
        "disease",
        "shadow",
        "necrotic"
      ],
      "origin": [
        "planar",
        "undead"
      ],
      "delivery": [
        "aura",
        "inhaled"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "dazzled"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {}
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "5d6",
            "void"
          ],
          [
            "condition",
            "drained",
            1
          ]
        ],
        {
          "componentPersistence": [
            "stage",
            "timed"
          ],
          "componentDurations": [
            null,
            [
              1,
              "days"
            ]
          ],
          "periodics": [
            {
              "id": "black-sun",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "void"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "6d6",
            "void"
          ],
          [
            "condition",
            "drained",
            2
          ],
          [
            "condition",
            "doomed",
            1
          ]
        ],
        {
          "healing": "affliction-damage",
          "periodics": [
            {
              "id": "black-sun",
              "interval": [
                10,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "void"
                ]
              ]
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      1,
      "days"
    ],
    "stubborn": false,
    "virulent": true,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "unperson-protocol",
    "level": 19,
    "dc": 39,
    "type": "curse",
    "rarity": "rare",
    "stat": "will",
    "tags": {
      "creature": [
        "construct",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "planar"
      ],
      "theme": [
        "curse",
        "mental",
        "corruption"
      ],
      "origin": [
        "arcane",
        "technological"
      ],
      "delivery": [
        "ability",
        "contact"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "modifiers": [
            {
              "id": "erased-presence",
              "value": -5,
              "selectors": [
                "all-speeds"
              ],
              "type": "status"
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "componentPersistence": [
            "timed"
          ],
          "componentDurations": [
            [
              1,
              "days"
            ]
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "6d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ],
          [
            "condition",
            "doomed",
            1
          ]
        ],
        {
          "blockSpeak": true,
          "expiry": "stay",
          "reactions": [
            {
              "id": "assert-self",
              "event": "initiative-rolled",
              "components": [],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [],
              "actions": {
                "criticalSuccess": "recover",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      7,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  },
  {
    "slug": "black-archive-seal",
    "level": 20,
    "dc": 40,
    "type": "curse",
    "rarity": "unique",
    "stat": "will",
    "tags": {
      "creature": [
        "monitor",
        "aberration",
        "humanoid"
      ],
      "habitat": [
        "urban",
        "planar",
        "underground"
      ],
      "theme": [
        "curse",
        "mental",
        "corruption",
        "shadow"
      ],
      "origin": [
        "occult",
        "planar"
      ],
      "delivery": [
        "contact",
        "ability",
        "aura"
      ]
    },
    "stages": [
      [
        [
          1,
          "hours"
        ],
        [
          [
            "condition",
            "stupefied",
            1
          ]
        ],
        {
          "periodics": [
            {
              "id": "sealed-whisper",
              "interval": [
                30,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "5d6",
            "mental"
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "blockSpeak": true,
          "gate": 9,
          "periodics": [
            {
              "id": "sealed-whisper",
              "interval": [
                10,
                "minutes"
              ],
              "components": [
                [
                  "damage",
                  "2d6",
                  "mental"
                ]
              ]
            }
          ]
        }
      ],
      [
        [
          1,
          "hours"
        ],
        [
          [
            "damage",
            "6d6",
            "void"
          ],
          [
            "condition",
            "doomed",
            1
          ],
          [
            "condition",
            "stupefied",
            2
          ]
        ],
        {
          "healing": "all",
          "expiry": "stay",
          "reactions": [
            {
              "id": "break-seal",
              "event": "turn-start",
              "components": [],
              "damageTypes": [],
              "conditionSlugs": [],
              "checked": true,
              "applyOn": [],
              "actions": {
                "criticalSuccess": "recover",
                "success": "none",
                "failure": "none",
                "criticalFailure": "none"
              },
              "delta": 0
            }
          ]
        }
      ],
      [
        [
          1,
          "rounds"
        ],
        [
          [
            "death",
            "death-effect"
          ]
        ],
        {
          "expiry": "end"
        }
      ]
    ],
    "onset": null,
    "maxDuration": [
      7,
      "days"
    ],
    "stubborn": true,
    "virulent": false,
    "injuryPoison": false,
    "identification": "identified",
    "locks": [],
    "rootHealing": "none"
  }
];
export const BLACK_ARCHIVE_MODULE_ID=MODULE_ID;
export const BLACK_ARCHIVE_CONTENT_VERSION=CONTENT_VERSION;
export const BLACK_ARCHIVE_DEFINITIONS=Object.freeze(SPECS.map(makeDefinition));
export function createBlackArchiveDefinitions(){return BLACK_ARCHIVE_DEFINITIONS.map(d=>structuredClone(d));}
