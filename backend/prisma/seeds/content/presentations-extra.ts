/**
 * Additional multi-mode presentation content ("Learn" tab) for the topics that
 * weren't covered by presentations.ts. Same shape as PRESENTATIONS.
 * Keyed by topic slug (must exist from full-seed). IT-themed examples.
 */
import type { PresentationSeed } from "./presentations";

export const PRESENTATIONS_EXTRA: Record<string, PresentationSeed[]> = {
  // ===================== UNIT 1 =====================
  "nouns-plural": [
    {
      mode: "DISCOVERY",
      contentMd:
        "Look at these:\n\n- *one **server** → two **servers***\n- *one **class** → two **classes***\n- *one **library** → two **libraries***\n\nWhy do the endings change?",
    },
    {
      mode: "FORM",
      contentMd:
        "Most nouns: add **-s** → *bug → bugs*.\n\n- ends in -s, -ss, -sh, -ch, -x → add **-es**: *class → classes, branch → branches*\n- consonant + y → **-ies**: *library → libraries*\n- vowel + y → just **-s**: *key → keys*\n- many -f/-fe → **-ves**: *life → lives*",
    },
    {
      mode: "MEANING",
      contentMd:
        "A plural noun means **more than one**. In English the noun itself changes — you can't rely on the number word alone:\n\n- *three **files***, *several **users***, *many **requests***.",
    },
    {
      mode: "USE",
      contentMd:
        "Some nouns are **irregular**: *man → men, woman → women, child → children, person → people*.\n\nA few don't change: *one series → two series, one species → two species*.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Bug report:** \"Two **queries** time out when many **users** open the dashboard. The **caches** are full and several **processes** restart.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common plural mistakes:",
      payload: {
        items: [
          { wrong: "two librarys", right: "two libraries", reason: "consonant + y → -ies." },
          { wrong: "many childs", right: "many children", reason: "irregular plural." },
          { wrong: "some informations", right: "some information", reason: "uncountable — no plural -s." },
        ],
      },
    },
  ],

  "personality-adjectives": [
    {
      mode: "DISCOVERY",
      contentMd:
        "Which word describes a good teammate?\n\n- *reliable*\n- *careless*\n- *curious*\n\nWhat does each one tell you about the person?",
    },
    {
      mode: "FORM",
      contentMd:
        "Adjectives go **before a noun** or **after *be***:\n\n- *a **reliable** developer*\n- *She **is** very **organised**.*\n\nAdjectives don't change for plural: *reliable developers* (not ~~reliables~~).",
    },
    {
      mode: "MEANING",
      contentMd:
        "Useful IT-team adjectives: **reliable, curious, patient, organised, proactive, detail-oriented** (positive); **careless, stubborn, impatient** (negative).",
    },
    {
      mode: "USE",
      contentMd:
        "Strengthen with **very / really / quite**: *He is **really** proactive.*\n\nDescribe people in standups, reviews and self-assessments: *I'm **detail-oriented** and **patient** under pressure.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Performance review:** \"Aziz is **reliable** and **curious** — he asks good questions in reviews. He could be more **organised** with his tickets.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out for:",
      payload: {
        items: [
          { wrong: "a reliables engineer", right: "a reliable engineer", reason: "adjectives have no plural form." },
          { wrong: "She is a person very organised.", right: "She is a very organised person.", reason: "adjective + noun order." },
        ],
      },
    },
  ],

  // ===================== UNIT 2 =====================
  "there-is-are": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *There **is** a bug in production.*\n- *There **are** three open tickets.*\n\nWhen do we use *is* and when *are*?",
    },
    {
      mode: "FORM",
      contentMd:
        "**There is** + singular / uncountable noun.\n**There are** + plural noun.\n\nNegative: *There **isn't** / **aren't***. Question: ***Is** there…? / **Are** there…?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "We use *there is / there are* to say that something **exists** or is **present** somewhere:\n\n- *There is a firewall between the networks.*\n- *There are two data centres.*",
    },
    {
      mode: "USE",
      contentMd:
        "The verb agrees with the **first** noun in a list:\n\n- *There **is** a router and two switches.*\n- *There **are** two switches and a router.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Onboarding:** \"**There is** a staging server for tests, and **there are** three environments: dev, staging and production. **Is there** a VPN? Yes, **there is**.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Typical mistakes:",
      payload: {
        items: [
          { wrong: "There is two errors.", right: "There are two errors.", reason: "plural noun → are." },
          { wrong: "There are a problem.", right: "There is a problem.", reason: "singular noun → is." },
          { wrong: "It is a bug in the code.", right: "There is a bug in the code.", reason: "existence → there is, not it is." },
        ],
      },
    },
  ],

  "prepositions-of-place": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *The file is **in** the folder.*\n- *The icon is **on** the desktop.*\n- *The cable is **under** the desk.*\n\nEach preposition shows a different position. Can you picture them?",
    },
    {
      mode: "FORM",
      contentMd:
        "Common ones: **in** (inside), **on** (on a surface), **under**, **next to / beside**, **between**, **behind**, **in front of**, **above / below**.\n\nStructure: *noun + be + preposition + noun*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "- **in** → enclosed space: *in the server room*\n- **on** → contact with a surface: *on the screen*\n- **at** → a point/location: *at the workstation*",
    },
    {
      mode: "USE",
      contentMd:
        "Describe layouts and UIs: *The button is **next to** the search bar. The menu is **above** the content. The logs are **in** the `/var/log` directory.*",
    },
    {
      mode: "VISUAL",
      contentMd: "Position words map physical relationships in space.",
      payload: {
        type: "table",
        headers: ["Preposition", "Meaning", "Example"],
        rows: [
          ["in", "inside", "in the folder"],
          ["on", "on a surface", "on the screen"],
          ["between", "in the middle of two", "between two servers"],
          ["next to", "beside", "next to the router"],
        ],
      },
    },
    {
      mode: "ERRORS",
      contentMd: "Common confusions:",
      payload: {
        items: [
          { wrong: "The file is on the folder.", right: "The file is in the folder.", reason: "inside → in." },
          { wrong: "in the screen", right: "on the screen", reason: "surface → on." },
        ],
      },
    },
  ],

  // ===================== UNIT 3 =====================
  "present-continuous": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *Right now the server **is restarting**.*\n- *The team **is deploying** a hotfix.*\n\nWhen are these actions happening?",
    },
    {
      mode: "FORM",
      contentMd:
        "**am / is / are + verb-ing**.\n\n- I **am** working\n- he/she/it **is** working\n- you/we/they **are** working\n\nNegative: *isn't/aren't + -ing*. Question: *Is/Are + subject + -ing?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Present Continuous = an action **in progress now** or **around now**:\n\n- *The build **is running**.* (this moment)\n- *We **are migrating** to the cloud this month.* (current period)",
    },
    {
      mode: "USE",
      contentMd:
        "Time markers: **now, right now, at the moment, currently, today, this week**.\n\nNote: state verbs (*know, want, need, belong*) are normally **not** used in -ing form.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Standup:** \"I **am fixing** the login bug right now, and the pipeline **is deploying** to staging. QA **is testing** the previous build.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out:",
      payload: {
        items: [
          { wrong: "The server restarting.", right: "The server is restarting.", reason: "need am/is/are." },
          { wrong: "I am knowing the answer.", right: "I know the answer.", reason: "state verb → no -ing." },
        ],
      },
    },
  ],

  "simple-vs-continuous": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *The CI **runs** the tests on every push.*\n- *The CI **is running** the tests right now.*\n\nWhat's the difference in meaning?",
    },
    {
      mode: "FORM",
      contentMd:
        "**Present Simple:** base / base+s (routine).\n**Present Continuous:** am/is/are + -ing (now).",
    },
    {
      mode: "MEANING",
      contentMd:
        "- Simple → habits, facts, schedules: *I deploy on Fridays.*\n- Continuous → in progress now / temporary: *I'm deploying right now.*",
    },
    {
      mode: "CONTRAST",
      contentMd: "Routine vs this moment:",
      payload: {
        pairs: [
          {
            a: "He reviews PRs every morning.",
            b: "He is reviewing a PR right now.",
            whyA: "Regular habit → Present Simple",
            whyB: "Action in progress → Present Continuous",
          },
          {
            a: "The app works offline.",
            b: "The app isn't working at the moment.",
            whyA: "General fact → Present Simple",
            whyB: "Temporary situation now → Present Continuous",
          },
        ],
      },
    },
    {
      mode: "USE",
      contentMd:
        "Simple markers: *always, usually, every day*. Continuous markers: *now, at the moment, currently*.",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mix-ups:",
      payload: {
        items: [
          { wrong: "I am usually working from home.", right: "I usually work from home.", reason: "routine → Present Simple." },
          { wrong: "Look! The bot answer now.", right: "Look! The bot is answering now.", reason: "happening now → Continuous." },
        ],
      },
    },
  ],

  // ===================== UNIT 4 =====================
  "countable-uncountable": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *two **laptops*** ✓\n- *two ~~softwares~~* ✗ → *two pieces of **software***\n\nWhy can't we count *software*?",
    },
    {
      mode: "FORM",
      contentMd:
        "**Countable**: have singular & plural, take a/an: *a file → files*.\n**Uncountable**: no plural, no a/an: *software, hardware, data, information, storage, traffic*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "Uncountable nouns are seen as a **mass**, not separate units. To count them, use a unit phrase: *a **piece of** software, a **lot of** data, two **gigabytes of** storage*.",
    },
    {
      mode: "USE",
      contentMd:
        "Quantifiers:\n- countable: *many, a few, a number of* → *many bugs*\n- uncountable: *much, a little, a great deal of* → *much traffic*\n- both: *some, any, a lot of, plenty of*.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Status:** \"We collected **a lot of data** and found **a few bugs**. There isn't **much storage** left, so we need **more hardware**.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Frequent errors:",
      payload: {
        items: [
          { wrong: "many informations", right: "much information", reason: "uncountable → much, no -s." },
          { wrong: "a software", right: "a piece of software", reason: "uncountable → no a/an directly." },
          { wrong: "how much files", right: "how many files", reason: "countable → many." },
        ],
      },
    },
  ],

  "articles": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *I opened **a** ticket.*\n- *I closed **the** ticket.*\n- *We use ∅ Python.*\n\nWhy *a*, then *the*, then nothing?",
    },
    {
      mode: "FORM",
      contentMd:
        "**a/an** = one, non-specific (an before a vowel **sound**: *an API, an hour*).\n**the** = specific / already known.\n**no article (∅)** = general plural or uncountable.",
    },
    {
      mode: "MEANING",
      contentMd:
        "- First mention / one of many → **a/an**: *a server crashed*.\n- Known / mentioned before / unique → **the**: *the server we use*, *the internet*.\n- Things in general → **∅**: *Servers need maintenance.*",
    },
    {
      mode: "USE",
      contentMd:
        "Say letters by sound: *an **S**SD, a **U**RL, an **H**TTP request* (H = 'aitch', vowel sound). Use **the** for unique systems: *the database, the production server*.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Incident:** \"**A** user reported **an** error. **The** error happened on **the** payments service. ∅ Errors like this are rare.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common article errors (no articles in Russian):",
      payload: {
        items: [
          { wrong: "I opened ticket.", right: "I opened a ticket.", reason: "first mention, singular countable → a." },
          { wrong: "a information", right: "information / a piece of information", reason: "uncountable → no a." },
          { wrong: "an URL", right: "a URL", reason: "'you-R-L' starts with a consonant sound." },
        ],
      },
    },
  ],

  // ===================== UNIT 5 =====================
  "past-simple-irregular": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *write → **wrote***\n- *build → **built***\n- *go → **went***\n\nThese don't add -ed. How do you learn them?",
    },
    {
      mode: "FORM",
      contentMd:
        "Irregular verbs change form in the past — no **-ed**. They must be memorised:\n\n- *make → made, find → found, take → took, run → ran, get → got, do → did, have → had*.\n\nNegatives/questions still use **did(n't) + base**: *didn't write*, *Did you build…?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Same meaning as regular Past Simple — a **finished action in the past**:\n\n- *We **wrote** the migration yesterday.*\n- *The deploy **went** fine.*",
    },
    {
      mode: "USE",
      contentMd:
        "Time markers: **yesterday, last week, in 2020, two hours ago, then**.\n\nAfter *did*, the verb returns to base form: *I **did** not **write*** (not ~~wrote~~).",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Retro:** \"We **shipped** late because the API **broke**. I **found** the cause, **wrote** a fix, and the tests **caught** the rest.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Frequent slips:",
      payload: {
        items: [
          { wrong: "I writed a script.", right: "I wrote a script.", reason: "irregular: write → wrote." },
          { wrong: "He didn't wrote tests.", right: "He didn't write tests.", reason: "after did → base form." },
          { wrong: "We goed live.", right: "We went live.", reason: "irregular: go → went." },
        ],
      },
    },
  ],

  // ===================== UNIT 6 =====================
  "past-continuous": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *At 3 PM the server **was deploying**.*\n- *While I **was debugging**, the power went out.*\n\nWhat kind of past action is this?",
    },
    {
      mode: "FORM",
      contentMd:
        "**was / were + verb-ing**.\n\n- I/he/she/it **was** working\n- you/we/they **were** working\n\nNegative: *wasn't/weren't + -ing*. Question: *Was/Were + subject + -ing?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Past Continuous = an action **in progress at a moment in the past** (often interrupted):\n\n- *I **was running** the tests when it crashed.*\n- *They **were monitoring** traffic all night.*",
    },
    {
      mode: "USE",
      contentMd:
        "Often with **when** (+ Past Simple interruption) and **while** (+ Past Continuous):\n\n- *I **was deploying** **when** the alert fired.*\n- ***While** the job **was running**, I reviewed the logs.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Incident report:** \"At 02:00 the service **was handling** normal traffic. While it **was scaling up**, a node **was failing** repeatedly.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out:",
      payload: {
        items: [
          { wrong: "I was deploy at 3 PM.", right: "I was deploying at 3 PM.", reason: "need -ing form." },
          { wrong: "They was testing.", right: "They were testing.", reason: "they → were." },
        ],
      },
    },
  ],

  "past-simple-vs-continuous": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *I **was writing** code when the server **crashed**.*\n\nOne action was in progress; the other interrupted it. Which is which?",
    },
    {
      mode: "FORM",
      contentMd:
        "**Past Continuous** (was/were + -ing) = the longer background action.\n**Past Simple** = the shorter completed action that interrupts it.",
    },
    {
      mode: "MEANING",
      contentMd:
        "- Background, in progress → Past Continuous: *I **was deploying**…*\n- Sudden, completed event → Past Simple: *…when the alert **fired**.*",
    },
    {
      mode: "CONTRAST",
      contentMd: "Background vs interruption:",
      payload: {
        pairs: [
          {
            a: "While I was testing, the build broke.",
            b: "When the build broke, I rolled back.",
            whyA: "was testing = ongoing background → Continuous",
            whyB: "broke / rolled back = completed events → Simple",
          },
        ],
      },
    },
    {
      mode: "USE",
      contentMd:
        "**when** usually introduces the Past Simple event; **while** usually introduces the Past Continuous background.",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "When I deployed, the phone was ringing and I answered while I was talking.", right: "While I was deploying, the phone rang and I answered it.", reason: "ongoing → Continuous; sudden → Simple." },
          { wrong: "I was finishing the task at 5 PM (= completed).", right: "I finished the task at 5 PM.", reason: "completed action → Past Simple." },
        ],
      },
    },
  ],

  // ===================== UNIT 7 =====================
  "comparatives": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *SSDs are **faster than** HDDs.*\n- *This algorithm is **more efficient than** that one.*\n\nWhy *faster* but *more efficient*?",
    },
    {
      mode: "FORM",
      contentMd:
        "Short adjectives (1 syllable): **-er + than** → *fast → faster*.\nLong adjectives (2+ syllables): **more + adjective + than** → *efficient → more efficient*.\nIrregular: *good → better, bad → worse, far → further*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "A comparative compares **two** things:\n\n- *Redis is **faster than** disk.*\n- *This bug is **harder** to fix **than** the last one.*",
    },
    {
      mode: "USE",
      contentMd:
        "Spelling: consonant-vowel-consonant doubles → *big → bigger*; -y → -ier → *easy → easier*.\nAdd *much / far / a bit* for degree: *much faster, a bit slower*.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Benchmark:** \"The new endpoint is **faster** and **more reliable than** the old one, but it's **more expensive** to run.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Frequent errors:",
      payload: {
        items: [
          { wrong: "more faster", right: "faster", reason: "don't combine -er and more." },
          { wrong: "efficienter", right: "more efficient", reason: "long adjective → more." },
          { wrong: "faster that HDDs", right: "faster than HDDs", reason: "comparison word is 'than'." },
        ],
      },
    },
  ],

  "superlatives": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *Python is **the most popular** language on the team.*\n- *This is **the fastest** server we have.*\n\nThese pick out one item from a whole group. How are they formed?",
    },
    {
      mode: "FORM",
      contentMd:
        "Short adjectives: **the + -est** → *fast → the fastest*.\nLong adjectives: **the most + adjective** → *the most reliable*.\nIrregular: *good → the best, bad → the worst*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "A superlative compares **three or more** and marks the top/bottom: *the **biggest** table, the **least** stable build*.",
    },
    {
      mode: "USE",
      contentMd:
        "Almost always with **the**. Often followed by *in / of*: *the fastest **in** the cluster, the best **of** all releases*. Use *least* for the opposite: *the least secure option*.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Review:** \"This is **the most stable** release this year and **the fastest** so far, but **the hardest** one to roll back.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "the most fastest", right: "the fastest", reason: "don't combine most and -est." },
          { wrong: "most reliable server", right: "the most reliable server", reason: "superlatives need 'the'." },
        ],
      },
    },
  ],

  // ===================== UNIT 8 =====================
  "present-perfect": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *I **have deployed** the fix.*\n- *We **have used** Docker since 2019.*\n\nThe action is past, but it connects to now. How?",
    },
    {
      mode: "FORM",
      contentMd:
        "**have / has + past participle**.\n\n- I/you/we/they **have** finished\n- he/she/it **has** finished\n\nNegative: *haven't/hasn't + participle*. Question: *Have/Has + subject + participle?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Present Perfect links **past to present**:\n\n- result now: *I **have fixed** the bug.* (it's fixed now)\n- experience: *I **have worked** with Kafka.*\n- unfinished time: *We **have shipped** twice this week.*",
    },
    {
      mode: "USE",
      contentMd:
        "Markers: **just, already, yet, ever, never, since, for, so far, recently**.\n\n- *since* + point in time: *since Monday*.\n- *for* + duration: *for three years*.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Update:** \"I **have merged** the PR and **have already** run the tests. QA **hasn't** signed off **yet**. We **have had** no incidents **so far**.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Typical errors:",
      payload: {
        items: [
          { wrong: "I have finish.", right: "I have finished.", reason: "need past participle." },
          { wrong: "I have deployed it yesterday.", right: "I deployed it yesterday.", reason: "finished time → Past Simple." },
          { wrong: "since three years", right: "for three years", reason: "duration → for." },
        ],
      },
    },
  ],

  // ===================== UNIT 9 =====================
  "will-going-to": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *I think it **will** rain on demo day.*\n- *We **are going to** migrate next sprint.*\n\nBoth talk about the future — what's different?",
    },
    {
      mode: "FORM",
      contentMd:
        "**will + base verb** → *I will check*.\n**be going to + base verb** → *I am going to check*.\n\nNegatives: *won't* / *am/is/are not going to*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "- **will** → decision made now, prediction, promise, offer: *I'll fix it.*\n- **be going to** → plan/intention already decided, or prediction from evidence: *We're going to refactor this.* / *Look at the load — it's going to crash.*",
    },
    {
      mode: "CONTRAST",
      contentMd: "Spontaneous vs planned:",
      payload: {
        pairs: [
          {
            a: "The build failed — I'll restart it.",
            b: "We're going to rewrite this module.",
            whyA: "decision at the moment of speaking → will",
            whyB: "plan decided earlier → be going to",
          },
        ],
      },
    },
    {
      mode: "USE",
      contentMd:
        "Markers: **probably, I think, maybe** (will); **next week, this sprint, plan to** (going to).",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out:",
      payload: {
        items: [
          { wrong: "I will to check.", right: "I will check.", reason: "will + base, no 'to'." },
          { wrong: "I am going check.", right: "I am going to check.", reason: "be going to + base." },
        ],
      },
    },
  ],

  "present-continuous-future": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *We **are releasing** on Friday.*\n- *I **am meeting** the client at 3.*\n\nThese are -ing forms, but they talk about the future. Why?",
    },
    {
      mode: "FORM",
      contentMd:
        "**am / is / are + verb-ing** + a future time expression.\n\n*The team **is demoing** the feature tomorrow.*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Present Continuous for the future = a **fixed arrangement** already organised (often with another person, a calendar entry):\n\n- *I **am presenting** at the standup tomorrow.*",
    },
    {
      mode: "USE",
      contentMd:
        "Always add/imply a future time: *tonight, tomorrow, on Monday, next week*. Without it, the same form means 'now'. Best for planned meetings, releases, calls.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Calendar:** \"We **are deploying** Thursday night, I **am pairing** with Dasha tomorrow, and the client **is joining** the review on Friday.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common slips:",
      payload: {
        items: [
          { wrong: "We are release on Friday.", right: "We are releasing on Friday.", reason: "need -ing." },
          { wrong: "Maybe I am meeting them. (not arranged)", right: "Maybe I will meet them.", reason: "uncertain → will, not arrangement." },
        ],
      },
    },
  ],

  // ===================== UNIT 10 =====================
  "modals-obligation": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *You **must** enable 2FA.*\n- *You **have to** rotate keys monthly.*\n- *You **mustn't** share passwords.*\n\nThese give rules. Are they the same?",
    },
    {
      mode: "FORM",
      contentMd:
        "**must / mustn't + base** (no -s, no 'to').\n**have to / has to + base**; negative *don't/doesn't have to*.\n\n*Every user **must** verify. He **has to** sign in.*",
    },
    {
      mode: "MEANING",
      contentMd:
        "- **must** → strong obligation, often the speaker's/internal rule.\n- **have to** → obligation from outside (policy, law).\n- **mustn't** → prohibition (don't do it).\n- **don't have to** → no obligation (optional).",
    },
    {
      mode: "USE",
      contentMd:
        "Note the key contrast: ***mustn't*** ≠ ***don't have to***.\n\n- *You **mustn't** commit secrets.* (forbidden)\n- *You **don't have to** review your own PR.* (not required)",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Security policy:** \"Engineers **must** use the VPN and **have to** enable 2FA. You **mustn't** disable the firewall. You **don't have to** encrypt internal test data.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Frequent errors:",
      payload: {
        items: [
          { wrong: "You must to enable it.", right: "You must enable it.", reason: "must + base, no 'to'." },
          { wrong: "You don't must share keys.", right: "You mustn't share keys.", reason: "prohibition → mustn't." },
        ],
      },
    },
  ],

  "modals-advice": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *You **should** write tests.*\n- *You **had better** back up first.*\n\nThese give advice. Which one sounds more urgent?",
    },
    {
      mode: "FORM",
      contentMd:
        "**should / shouldn't + base**.\n**ought to + base**.\n**had better ('d better) + base** (negative: *had better not*).",
    },
    {
      mode: "MEANING",
      contentMd:
        "- **should / ought to** → general advice/recommendation.\n- **had better** → strong advice with a warning of a bad result if ignored: *You'd better fix it before release.*",
    },
    {
      mode: "USE",
      contentMd:
        "Soften with *maybe, I think, probably*: *Maybe you should add logging.* Ask for advice: *Should I cache this?*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Code review:** \"You **should** extract this into a function, and you **ought to** add a test. You **'d better not** merge before CI passes.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "You should to test it.", right: "You should test it.", reason: "should + base, no 'to'." },
          { wrong: "You had better to back up.", right: "You had better back up.", reason: "had better + base, no 'to'." },
        ],
      },
    },
  ],

  // ===================== UNIT 11 =====================
  "first-conditional": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *If the tests **pass**, we **will deploy**.*\n\nThis is a real future possibility. Notice the two verb forms.",
    },
    {
      mode: "FORM",
      contentMd:
        "**If + present simple, … will + base.**\n\n*If you **merge** this, CI **will run** automatically.*\n\nThe two clauses can swap order (no comma when *if* is second).",
    },
    {
      mode: "MEANING",
      contentMd:
        "First conditional = a **real, likely** condition and its future result:\n\n- *If the server **goes** down, the alert **will fire**.*",
    },
    {
      mode: "USE",
      contentMd:
        "You can replace *will* with *may / might / can / should* for nuance, or use an imperative: *If it fails, **restart** the job.* Use *unless* = *if not*: *Unless you cache it, it'll be slow.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Plan:** \"If QA **approves** today, we **will release** tonight. If we **find** a blocker, we **'ll postpone**.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Typical errors:",
      payload: {
        items: [
          { wrong: "If it will fail, we will roll back.", right: "If it fails, we will roll back.", reason: "no 'will' in the if-clause." },
          { wrong: "If you will merge it…", right: "If you merge it…", reason: "if + present simple." },
        ],
      },
    },
  ],

  "second-conditional": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *If we **had** more servers, we **would scale** easily.*\n\nWe don't have them — this is imaginary. See the past form + would?",
    },
    {
      mode: "FORM",
      contentMd:
        "**If + past simple, … would + base.**\n\n*If I **were** the lead, I **would refactor** this.* (use *were* for all persons in formal English).",
    },
    {
      mode: "MEANING",
      contentMd:
        "Second conditional = an **unreal / unlikely / hypothetical** present or future situation:\n\n- *If the budget **were** bigger, we **would hire** more.* (but it isn't)",
    },
    {
      mode: "CONTRAST",
      contentMd: "Real vs hypothetical:",
      payload: {
        pairs: [
          {
            a: "If the tests pass, we will deploy.",
            b: "If we had a staging cluster, we would test there.",
            whyA: "real, likely → First conditional",
            whyB: "imaginary / not true now → Second conditional",
          },
        ],
      },
    },
    {
      mode: "USE",
      contentMd:
        "Use *could / might* instead of *would* for possibility: *If we automated this, we **could** save hours.*",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "If we would have time, we would test.", right: "If we had time, we would test.", reason: "no 'would' in the if-clause." },
          { wrong: "If I was you", right: "If I were you", reason: "use 'were' in second conditional." },
        ],
      },
    },
  ],

  // ===================== UNIT 12 =====================
  "passive-present": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- Active: *Developers **write** the code.*\n- Passive: *The code **is written** by developers.*\n\nWho is the focus in each sentence?",
    },
    {
      mode: "FORM",
      contentMd:
        "**am / is / are + past participle**.\n\n- *The data **is encrypted**.*\n- *Backups **are stored** off-site.*\n\nAdd the doer with **by** only if needed: *…by the system*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "Use the passive when **the action matters more than the doer**, or the doer is obvious/unknown:\n\n- *The model **is trained** on millions of images.*",
    },
    {
      mode: "USE",
      contentMd:
        "Very common in technical writing and documentation: *Logs **are collected** automatically. The input **is validated** before processing.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Docs:** \"Requests **are authenticated** with a token. Each payload **is validated**, and errors **are logged** to the monitoring system.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out:",
      payload: {
        items: [
          { wrong: "The data is encrypt.", right: "The data is encrypted.", reason: "need past participle." },
          { wrong: "The files are store off-site.", right: "The files are stored off-site.", reason: "participle: stored." },
        ],
      },
    },
  ],

  "passive-past": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- Active: *A bug **caused** the outage.*\n- Passive: *The outage **was caused** by a bug.*\n\nThe past passive shifts focus to the result.",
    },
    {
      mode: "FORM",
      contentMd:
        "**was / were + past participle**.\n\n- *The server **was rebooted**.*\n- *The keys **were rotated** yesterday.*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Past passive describes a **completed past action** where the doer is unknown, unimportant, or obvious:\n\n- *The database **was migrated** overnight.*",
    },
    {
      mode: "USE",
      contentMd:
        "Common in incident reports and changelogs: *The patch **was applied**. Affected users **were notified**.* Add *by* for the agent only when relevant.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Post-mortem:** \"The incident **was detected** at 02:00. The faulty node **was removed**, traffic **was rerouted**, and customers **were informed**.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Typical errors:",
      payload: {
        items: [
          { wrong: "The server was reboot.", right: "The server was rebooted.", reason: "need past participle." },
          { wrong: "The keys was rotated.", right: "The keys were rotated.", reason: "plural subject → were." },
        ],
      },
    },
  ],

  // ===================== UNIT 13 =====================
  "relative-clauses": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *The engineer **who** wrote this left the team.*\n- *The bug **that** crashed the app is fixed.*\n\nThe highlighted words connect extra information to a noun.",
    },
    {
      mode: "FORM",
      contentMd:
        "Use **who** (people), **which** (things), **that** (people or things), **whose** (possession), **where** (places).\n\n*The service **which** handles auth…* / *The repo **where** we store configs…*",
    },
    {
      mode: "MEANING",
      contentMd:
        "A relative clause **identifies or adds info** about a noun:\n\n- defining (no commas, essential): *The dev **who** broke the build fixed it.*\n- non-defining (commas, extra): *Our lead, **who** joined in 2020, approved it.*",
    },
    {
      mode: "USE",
      contentMd:
        "In defining clauses you can drop the pronoun if it's the object: *The PR (that) I reviewed…* In non-defining clauses, never use *that* and never drop the pronoun.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Docs:** \"The token, **which** expires in 15 minutes, is signed by the service **that** issued it. Users **whose** sessions expire are redirected to the page **where** they log in.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "The bug who crashed the app", right: "The bug that/which crashed the app", reason: "thing → that/which, not who." },
          { wrong: "My manager, that joined in 2020,", right: "My manager, who joined in 2020,", reason: "non-defining → no 'that'." },
        ],
      },
    },
  ],

  "gerunds-infinitives": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *I enjoy **coding**.*\n- *I decided **to refactor**.*\n\nWhy *coding* after 'enjoy' but *to refactor* after 'decided'?",
    },
    {
      mode: "FORM",
      contentMd:
        "**Gerund** = verb + -ing used as a noun: *testing, deploying*.\n**Infinitive** = *to* + base: *to test, to deploy*.\n\nThe choice usually depends on the **first verb**.",
    },
    {
      mode: "MEANING",
      contentMd:
        "- Gerund after: *enjoy, avoid, finish, keep, suggest, consider, practise* and **prepositions** (*good at coding*).\n- Infinitive after: *want, need, decide, plan, hope, agree, learn* and many adjectives (*easy to read*).",
    },
    {
      mode: "USE",
      contentMd:
        "Use a gerund as a subject: ***Writing** tests saves time.* Some verbs take both with a meaning change: *remember **to** push* (don't forget) vs *remember **pushing*** (the memory).",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Standup:** \"I finished **writing** the tests and decided **to refactor** the service. I'm good at **debugging**, so I plan **to pair** with a junior.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Frequent errors:",
      payload: {
        items: [
          { wrong: "I enjoy to code.", right: "I enjoy coding.", reason: "enjoy + gerund." },
          { wrong: "I decided refactoring.", right: "I decided to refactor.", reason: "decide + infinitive." },
          { wrong: "good at to debug", right: "good at debugging", reason: "after a preposition → gerund." },
        ],
      },
    },
  ],

  // ===================== UNIT 14 =====================
  "reported-speech": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- Direct: *\"The build **is** broken,\" she said.*\n- Reported: *She said the build **was** broken.*\n\nNotice how the tense shifts back.",
    },
    {
      mode: "FORM",
      contentMd:
        "Tenses usually move **one step back**: present → past, past → past perfect, *will → would*, *can → could*.\n\nPronouns and time words also change: *I → she, today → that day, tomorrow → the next day*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "Reported (indirect) speech tells **what someone said** without quoting their exact words:\n\n- *He said (that) he **had fixed** it.*",
    },
    {
      mode: "USE",
      contentMd:
        "*say* takes no object: *He **said** (that)…*; *tell* needs one: *He **told me** (that)…*\nReported questions use statement word order: *She asked **what the error was*** (not ~~was the error~~).",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Retro notes:** \"Dasha said the deploy **had failed**. Tom told us he **would** roll back. The PM asked **when** we **could** ship.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "He said me that…", right: "He told me that… / He said that…", reason: "say has no object; tell does." },
          { wrong: "She asked what was the error.", right: "She asked what the error was.", reason: "reported question → statement order." },
        ],
      },
    },
  ],

  "question-tags": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *The build passed, **didn't it**?*\n- *You haven't pushed yet, **have you**?*\n\nThe little tag checks or confirms. See the pattern?",
    },
    {
      mode: "FORM",
      contentMd:
        "Positive statement → **negative tag**; negative statement → **positive tag**. Repeat the auxiliary (or *do/does/did*):\n\n*It works, **doesn't it**? / It doesn't work, **does it**?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Tags ask for **confirmation or agreement**. Falling intonation = you expect agreement; rising = a real question.",
    },
    {
      mode: "USE",
      contentMd:
        "Special cases: *I am… → **aren't I**?*; *Let's… → **shall we**?*; imperative → ***will you**?*\nWith *there is*: *There's a bug, **isn't there**?*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Review:** \"You've run the tests, **haven't you**? This caches the result, **doesn't it**? Let's merge, **shall we**?\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out:",
      payload: {
        items: [
          { wrong: "It works, isn't it?", right: "It works, doesn't it?", reason: "main verb 'works' → use does." },
          { wrong: "You pushed it, didn't you push?", right: "You pushed it, didn't you?", reason: "tag = auxiliary + pronoun only." },
        ],
      },
    },
  ],

  // ===================== UNIT 15 =====================
  "third-conditional": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *If we **had tested** it, the bug **wouldn't have reached** production.*\n\nThe past can't change — this is a regret about what didn't happen.",
    },
    {
      mode: "FORM",
      contentMd:
        "**If + past perfect, … would have + past participle.**\n\n*If you **had reviewed** the PR, you **would have caught** it.*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Third conditional = an **unreal past** — imagining a different past and its different result. Often expresses regret or criticism.",
    },
    {
      mode: "USE",
      contentMd:
        "Swap *would* for *could/might have* for possibility: *We **might have shipped** on time if the API hadn't changed.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Post-mortem:** \"If we **had added** monitoring, we **would have noticed** the leak. If the alert **had fired**, on-call **could have responded** faster.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "If we would have tested it…", right: "If we had tested it…", reason: "no 'would' in the if-clause." },
          { wrong: "…we would catch it.", right: "…we would have caught it.", reason: "result → would have + participle." },
        ],
      },
    },
  ],

  "mixed-conditionals": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *If we **had hired** a tester, we **wouldn't be** firefighting now.*\n\nPast cause → present result. Two different times in one sentence.",
    },
    {
      mode: "FORM",
      contentMd:
        "Most common mix: **If + past perfect, … would + base** (past condition → present result).\n\nAlso: **If + past simple, … would have + participle** (present/always-true condition → past result).",
    },
    {
      mode: "MEANING",
      contentMd:
        "Mixed conditionals connect a condition and a result that are in **different times**:\n\n- *If I **had learned** Go, I **would be** on that team now.*",
    },
    {
      mode: "USE",
      contentMd:
        "Decide the time of each half separately: was the **cause** past or general? Is the **result** now or past? Then pick the matching forms.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Review:** \"If we **had documented** the API, onboarding **would be** easier today. If she **were** more senior, she **would have led** that project.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out:",
      payload: {
        items: [
          { wrong: "If we had hired a tester, we wouldn't have bugs now (would have).", right: "…we wouldn't have bugs now.", reason: "present result → would + base." },
          { wrong: "If we would have documented it…", right: "If we had documented it…", reason: "no 'would' in the if-clause." },
        ],
      },
    },
  ],

  // ===================== UNIT 16 =====================
  "past-perfect": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *By the time I arrived, the server **had crashed**.*\n\nTwo past events — which one happened first?",
    },
    {
      mode: "FORM",
      contentMd:
        "**had + past participle** (same for all persons).\n\n*The job **had finished** before the alert fired.* Negative: *hadn't + participle*.",
    },
    {
      mode: "MEANING",
      contentMd:
        "Past Perfect marks the **earlier** of two past actions — the 'past before the past':\n\n- *When we deployed, QA **had already approved**.*",
    },
    {
      mode: "USE",
      contentMd:
        "Often with **before, after, by the time, already, just, when**:\n\n- *After the cache **had warmed up**, response times dropped.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Incident:** \"By the time on-call logged in, the node **had failed** and traffic **had already shifted**. The team realised someone **had pushed** a bad config.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "When I arrived, the server has crashed.", right: "…the server had crashed.", reason: "earlier past → had + participle." },
          { wrong: "had finish", right: "had finished", reason: "need past participle." },
        ],
      },
    },
  ],

  "used-to": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *We **used to** deploy manually.*\n- *I **would** wait an hour for builds.*\n\nThese describe the past that is no longer true.",
    },
    {
      mode: "FORM",
      contentMd:
        "**used to + base** → *We used to use SVN.* Negative/question: *didn't use to / Did you use to…?* (no -d).\n**would + base** for repeated past actions.",
    },
    {
      mode: "MEANING",
      contentMd:
        "- **used to** → past habits **and** past states that have changed: *There **used to** be one server.*\n- **would** → repeated past **actions** only (not states): *Every Friday we **would** demo.*",
    },
    {
      mode: "USE",
      contentMd:
        "Use **used to** for states (*used to be, used to have*); **would** doesn't work with state verbs. Both contrast past with now.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**War story:** \"We **used to** deploy by FTP, and releases **would** take all night. There **used to** be no CI — someone **would** run the tests by hand.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Frequent errors:",
      payload: {
        items: [
          { wrong: "I didn't used to commit daily.", right: "I didn't use to commit daily.", reason: "after did → 'use to' (no -d)." },
          { wrong: "There would be one server. (state)", right: "There used to be one server.", reason: "states → used to, not would." },
        ],
      },
    },
  ],

  // ===================== UNIT 17 =====================
  "indirect-questions": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- Direct: *Where is the config?*\n- Indirect: *Could you tell me **where the config is**?*\n\nIndirect questions are more polite — and the word order changes.",
    },
    {
      mode: "FORM",
      contentMd:
        "Start with a phrase (*Could you tell me…, Do you know…, I wonder…*) then use **statement word order** (subject + verb), no inversion, no *do/does/did*.\n\n*Do you know **what time the demo starts**?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Indirect questions sound **more polite/formal** — useful in interviews, with clients, or in writing.",
    },
    {
      mode: "USE",
      contentMd:
        "Yes/no questions use **if / whether**: *I wonder **if** the API is documented.* Keep the final clause as a statement, even though the sentence is a question.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Interview:** \"Could you tell me **what the tech stack is**? I'd like to know **how the team handles** deploys, and **whether you do** code reviews.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "Do you know where is the file?", right: "Do you know where the file is?", reason: "indirect → statement order." },
          { wrong: "Could you tell me what does it do?", right: "Could you tell me what it does?", reason: "no 'does' in indirect questions." },
        ],
      },
    },
  ],

  "phrasal-verbs-it": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *The server **went down**.*\n- *Please **back up** the database.*\n- *I'll **look into** the bug.*\n\nVerb + particle = a new meaning. Can you guess each?",
    },
    {
      mode: "FORM",
      contentMd:
        "**verb + particle (+ preposition)**. Some are **separable**: *back **it** up / restart **it***; some are **inseparable**: *look into it* (not ~~look it into~~).",
    },
    {
      mode: "MEANING",
      contentMd:
        "Common IT phrasal verbs: *log in/out, back up, roll back, set up, shut down, spin up, run into (a problem), figure out, carry out, deploy out*.",
    },
    {
      mode: "USE",
      contentMd:
        "With separable phrasal verbs, a **pronoun** must go in the middle: *set **it** up* ✓ / *set up **it*** ✗. A noun can go either side: *set up the server / set the server up*.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Runbook:** \"**Spin up** a new node, **back up** the data, then **shut down** the old one. If you **run into** errors, **roll back** and **figure out** the cause.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Watch out:",
      payload: {
        items: [
          { wrong: "back up it", right: "back it up", reason: "pronoun goes inside a separable phrasal verb." },
          { wrong: "I'll look it into.", right: "I'll look into it.", reason: "'look into' is inseparable." },
        ],
      },
    },
  ],

  // ===================== UNIT 18 =====================
  "future-perfect-continuous": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *By 6 PM the build **will have finished**.*\n- *Next month I **will have been working** here for a year.*\n\nThese look forward to a point in the future and 'look back' from it.",
    },
    {
      mode: "FORM",
      contentMd:
        "**Future Continuous:** *will be + -ing* → *This time tomorrow I **will be deploying**.*\n**Future Perfect:** *will have + participle* → *By Friday we **will have shipped**.*\n**Future Perfect Continuous:** *will have been + -ing* → *…**will have been running** for 3 hours.*",
    },
    {
      mode: "MEANING",
      contentMd:
        "- Future Continuous → in progress at a future moment.\n- Future Perfect → completed **before** a future moment.\n- Future Perfect Continuous → emphasises **duration** up to a future moment.",
    },
    {
      mode: "USE",
      contentMd:
        "Markers: **by, by the time, this time tomorrow, in two weeks, for + duration**:\n\n- *By the time you read this, the migration **will have completed**.*",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Plan:** \"This time tomorrow we **will be testing** the release. By Friday QA **will have signed off**, and by launch the team **will have been preparing** for a month.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Common mistakes:",
      payload: {
        items: [
          { wrong: "By 6 PM the build will finished.", right: "…will have finished.", reason: "completed before a future point → will have + participle." },
          { wrong: "will have been work", right: "will have been working", reason: "perfect continuous → been + -ing." },
        ],
      },
    },
  ],

  "wish-clauses": [
    {
      mode: "DISCOVERY",
      contentMd:
        "- *I wish I **knew** Rust.*\n- *I wish I **had tested** it.*\n\nThe verb after 'wish' moves back in time. Why?",
    },
    {
      mode: "FORM",
      contentMd:
        "- *wish + past simple* → regret about the **present**: *I wish I **had** more time.*\n- *wish + past perfect* → regret about the **past**: *I wish I **had backed up**.*\n- *wish + would* → complaint about others' behaviour: *I wish the build **would** stop failing.*",
    },
    {
      mode: "MEANING",
      contentMd:
        "*wish / if only* express that something is **not true** and you want it to be different. *If only* is just a stronger *wish*.",
    },
    {
      mode: "USE",
      contentMd:
        "Use *were* for all persons: *I wish it **were** documented.* Don't use *wish + would* about yourself — use a different structure.",
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Retro:** \"I wish we **had** more tests. I wish I **had reviewed** that PR. If only the pipeline **would** run faster.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Frequent errors:",
      payload: {
        items: [
          { wrong: "I wish I know Rust.", right: "I wish I knew Rust.", reason: "present regret → past simple." },
          { wrong: "I wish I have tested it.", right: "I wish I had tested it.", reason: "past regret → past perfect." },
        ],
      },
    },
  ],
};
