/**
 * Approach 1 — multi-mode presentation content (ось A).
 * Pre-generated, stored in DB, zero runtime AI.
 * Keyed by topic slug (must exist from full-seed).
 */

export type PMode =
  | "DISCOVERY"
  | "FORM"
  | "MEANING"
  | "USE"
  | "VISUAL"
  | "CONTRAST"
  | "CONTEXT"
  | "ERRORS";

export interface PresentationSeed {
  mode: PMode;
  contentMd: string;
  payload?: Record<string, unknown>;
}

export const PRESENTATIONS: Record<string, PresentationSeed[]> = {
  // ===== Present Simple (Unit 1) =====
  "present-simple": [
    {
      mode: "DISCOVERY",
      contentMd:
        "Look at these two sentences:\n\n- *A developer **writes** code every day.*\n- *Right now she **is writing** a test.*\n\nWhich one is about a **routine / general truth**, and which is about **this exact moment**?",
    },
    {
      mode: "FORM",
      contentMd:
        "**Present Simple** = base verb.\n\n- I / you / we / they → **work**\n- he / she / it → **works** (add **-s**)\n\nNegative: *don't / doesn't + base*. Question: *Do / Does + subject + base?*",
    },
    {
      mode: "MEANING",
      contentMd:
        "Present Simple expresses things that are **generally true** or **happen regularly** — not tied to the present moment:\n\n- habits: *I deploy on Fridays.*\n- facts: *The server runs on Linux.*\n- schedules: *The standup starts at 10.*",
    },
    {
      mode: "USE",
      contentMd:
        "Common time markers: **always, usually, often, every day, on Mondays, twice a week**.\n\n*Our CI **runs** the test suite on every push.*",
    },
    {
      mode: "VISUAL",
      contentMd: "Present Simple = repeated points across time, not just 'now'.",
      payload: {
        type: "timeline",
        points: [
          { label: "past habit", at: -2 },
          { label: "today", at: 0 },
          { label: "future habit", at: 2 },
        ],
        note: "The action repeats — it isn't anchored to the present moment.",
      },
    },
    {
      mode: "CONTRAST",
      contentMd:
        "**Present Simple vs Present Continuous** — routine vs right now:",
      payload: {
        pairs: [
          {
            a: "She writes unit tests. (her job, in general)",
            b: "She is writing a unit test. (at this moment)",
            whyA: "Routine / general truth → Present Simple",
            whyB: "Action in progress now → Present Continuous",
          },
        ],
      },
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Standup:** \"I **work** on the payments service. Every morning I **check** the dashboards and **review** open PRs. The pipeline **runs** automatically on each merge.\"",
    },
    {
      mode: "ERRORS",
      contentMd:
        "Typical mistakes for Russian speakers (no -s agreement in Russian):",
      payload: {
        items: [
          {
            wrong: "A developer write code.",
            right: "A developer writes code.",
            reason: "3rd person singular needs **-s**.",
          },
          {
            wrong: "He don't deploy on Fridays.",
            right: "He doesn't deploy on Fridays.",
            reason: "With he/she/it use **doesn't**, not don't.",
          },
        ],
      },
    },
  ],

  // ===== Present Perfect vs Past Simple (worked example from the spec, Unit 8) =====
  "present-perfect-vs-past": [
    {
      mode: "DISCOVERY",
      contentMd:
        "*I **deployed** the fix at 3pm.* vs *I'**ve deployed** the fix.*\n\nIn which sentence does the exact **time** matter, and in which does the **result now** matter?",
    },
    {
      mode: "FORM",
      contentMd:
        "**Past Simple** = `verb-ed` / 2nd form (*deployed, went, wrote*).\n\n**Present Perfect** = `have/has + past participle` (*have deployed, has gone, have written*).",
    },
    {
      mode: "MEANING",
      contentMd:
        "**Past Simple** = finished at a specific moment in the past.\n**Present Perfect** = past action that **matters now** (result, experience, unfinished time).",
    },
    {
      mode: "USE",
      contentMd:
        "Past Simple with **yesterday, at 3pm, last week, in 2021**.\nPresent Perfect with **already, just, yet, since, so far, ever, never**.",
    },
    {
      mode: "VISUAL",
      contentMd: "Past Simple = a point. Present Perfect = an arrow into now.",
      payload: {
        type: "timeline",
        points: [
          { label: "Past Simple: went down at 3pm (a point)", at: -1 },
          { label: "Present Perfect: has been down since 3pm (→ now)", at: 0 },
        ],
      },
    },
    {
      mode: "CONTRAST",
      contentMd: "The same incident, two perspectives:",
      payload: {
        pairs: [
          {
            a: "The server went down at 3pm.",
            b: "The server has been down since 3pm.",
            whyA: "A finished moment → Past Simple",
            whyB: "Still down now → Present Perfect",
          },
        ],
      },
    },
    {
      mode: "CONTEXT",
      contentMd:
        "**Standup:** \"So far we'**ve merged** two PRs and **fixed** the login bug yesterday. The pipeline **has been** green since morning.\"",
    },
    {
      mode: "ERRORS",
      contentMd: "Russian has no perfect aspect — classic interference:",
      payload: {
        items: [
          {
            wrong: "I work here since 2020.",
            right: "I've worked here since 2020.",
            reason: "**since** + ongoing situation → Present Perfect.",
          },
          {
            wrong: "Did you finish already?",
            right: "Have you finished yet?",
            reason: "**already / yet** with a result now → Present Perfect.",
          },
        ],
      },
    },
  ],

  // ===== Past Simple (Unit 5) =====
  "past-simple": [
    {
      mode: "FORM",
      contentMd:
        "**Regular:** add **-ed** (*deployed, refactored, tested*).\n**Irregular:** 2nd form (*went, wrote, found, built*).\n\nQuestion/negative use **did / didn't + base**: *Did you deploy? — No, I didn't deploy.*",
    },
    {
      mode: "MEANING",
      contentMd:
        "A **completed action at a definite time in the past**. The time is finished and usually stated or understood.",
    },
    {
      mode: "USE",
      contentMd:
        "Markers: **yesterday, last sprint, two days ago, in 2021, at noon**.\n\n*We **shipped** the release **last Friday**.*",
    },
    {
      mode: "VISUAL",
      contentMd: "One finished point in the past.",
      payload: {
        type: "timeline",
        points: [
          { label: "released v2 (last Friday)", at: -1 },
          { label: "now", at: 0 },
        ],
      },
    },
    {
      mode: "ERRORS",
      contentMd: "Common slips:",
      payload: {
        items: [
          {
            wrong: "I didn't deployed it.",
            right: "I didn't deploy it.",
            reason: "After **did/didn't** use the base verb, not -ed.",
          },
          {
            wrong: "The build goed green.",
            right: "The build went green.",
            reason: "**go** is irregular: go → went.",
          },
        ],
      },
    },
  ],
};
