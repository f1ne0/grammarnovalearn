import { SeedUnit } from "./types";

export const UNITS_13_18: SeedUnit[] = [
  {
    unit: 13,
    title: "Project Management",
    topics: [
      {
        slug: "relative-clauses",
        title: "Relative Clauses: who / which / that",
        order: 1,
        readingText:
          "A project manager is a person who coordinates the team's work.\nA sprint is a period which usually lasts two weeks.\nThe tasks that block the release have the highest priority.\nJira, which we use every day, helps us track progress.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "A scrum master is someone _____ removes obstacles for the team.",
            payload: {
              options: [
                { id: "a", text: "which" },
                { id: "b", text: "who" },
                { id: "c", text: "where" },
                { id: "d", text: "whose" },
              ],
              correctAnswerId: "b",
              explanation: "Person → who (or that).",
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The feature _____ we discussed yesterday is now in development.",
            payload: {
              options: [
                { id: "a", text: "who" },
                { id: "b", text: "which" },
                { id: "c", text: "whom" },
                { id: "d", text: "whose" },
              ],
              correctAnswerId: "b",
              explanation: "Thing → which (or that).",
            },
            difficulty: 1,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "The developer _____ (possessive) code broke the build apologized to the team.",
            payload: {
              text: "The developer _____ code broke the build apologized to the team.",
              correctAnswers: ["whose"],
              explanation: "Possession → whose.",
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: '"That" can replace "who" and "which" in defining relative clauses.',
            payload: {
              correctAnswer: true,
              explanation:
                'Yes, in defining clauses: "the person that called", "the tool that we use".',
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "gerunds-infinitives",
        title: "Gerunds and Infinitives",
        order: 2,
        readingText:
          "We decided to postpone the release by one week.\nThe team enjoys working on challenging problems.\nWe agreed to split the epic into smaller stories.\nStop adding new features — we need to stabilize the build first.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "We decided _____ the deadline.",
            payload: {
              options: [
                { id: "a", text: "extending" },
                { id: "b", text: "to extend" },
                { id: "c", text: "extend" },
                { id: "d", text: "extended" },
              ],
              correctAnswerId: "b",
              explanation: "decide + to-infinitive.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "I don't mind _____ late if the release is at risk.",
            payload: {
              options: [
                { id: "a", text: "to work" },
                { id: "b", text: "working" },
                { id: "c", text: "work" },
                { id: "d", text: "worked" },
              ],
              correctAnswerId: "b",
              explanation: "mind + gerund (-ing).",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She suggested _____ (use) a Kanban board instead.",
            payload: {
              text: "She suggested _____ a Kanban board instead.",
              correctAnswers: ["using"],
              explanation: "suggest + gerund.",
            },
            difficulty: 2,
          },
          {
            type: "MATCHING",
            prompt: "Match the verb with the form that follows it.",
            payload: {
              left: [
                { id: "1", text: "want" },
                { id: "2", text: "finish" },
                { id: "3", text: "plan" },
              ],
              right: [
                { id: "a", text: "+ gerund (-ing)" },
                { id: "b", text: "+ to-infinitive" },
                { id: "c", text: "+ to-infinitive" },
              ],
              pairs: [
                ["1", "b"],
                ["2", "a"],
                ["3", "c"],
              ],
              explanation: "want to do, finish doing, plan to do.",
            },
            difficulty: 3,
          },
        ],
      },
    ],
  },
  {
    unit: 14,
    title: "Agile & Teamwork",
    topics: [
      {
        slug: "reported-speech",
        title: "Reported Speech",
        order: 1,
        readingText:
          "The PM said that the client wanted two more changes.\nAnna told us she had finished the integration tests.\nThe CTO announced that the company was moving to a four-day week.\nHe asked whether we could demo the feature on Friday.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: '"I am working on it." → She said she _____ on it.',
            payload: {
              options: [
                { id: "a", text: "is working" },
                { id: "b", text: "was working" },
                { id: "c", text: "worked" },
                { id: "d", text: "works" },
              ],
              correctAnswerId: "b",
              explanation:
                "Reported speech: Present Continuous → Past Continuous.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: '"We fixed the bug." → They said they _____ the bug.',
            payload: {
              options: [
                { id: "a", text: "fixed" },
                { id: "b", text: "had fixed" },
                { id: "c", text: "have fixed" },
                { id: "d", text: "fix" },
              ],
              correctAnswerId: "b",
              explanation: "Past Simple → Past Perfect in reported speech.",
            },
            difficulty: 3,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: '"I will join the call." → He said he _____ (join) the call.',
            payload: {
              text: "He said he _____ the call.",
              correctAnswers: ["would join"],
              explanation: "will → would in reported speech.",
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: 'We use "tell" with an object (tell me) and "say" without (say that).',
            payload: {
              correctAnswer: true,
              explanation: 'Correct: "She told me..." but "She said that..."',
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "question-tags",
        title: "Question Tags",
        order: 2,
        readingText:
          "You have pushed the latest commit, haven't you?\nThe standup starts at ten, doesn't it?\nWe shouldn't merge this without review, should we?\nThe tests passed, didn't they?",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The demo went well, _____?",
            payload: {
              options: [
                { id: "a", text: "didn't it" },
                { id: "b", text: "wasn't it" },
                { id: "c", text: "did it" },
                { id: "d", text: "isn't it" },
              ],
              correctAnswerId: "a",
              explanation:
                "Positive Past Simple («went») → negative tag with did: didn't it?",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "You can review my PR today, _____?",
            payload: {
              options: [
                { id: "a", text: "can you" },
                { id: "b", text: "can't you" },
                { id: "c", text: "do you" },
                { id: "d", text: "don't you" },
              ],
              correctAnswerId: "b",
              explanation: "Positive statement → negative tag: can't you?",
            },
            difficulty: 1,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She isn't on vacation, _____ she?",
            payload: {
              text: "She isn't on vacation, _____ she?",
              correctAnswers: ["is"],
              explanation: "Negative statement → positive tag: is she?",
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "You are checking the sprint status with a teammate. Ask 4 questions with question tags (about tests, deploy, documentation, deadlines).",
            payload: {
              example:
                "You have finished the tests, haven't you? The deploy went smoothly, didn't it? We don't need to update the docs, do we? The deadline is Friday, isn't it?",
              explanation: "Positive sentence → negative tag, and vice versa.",
            },
            difficulty: 3,
          },
        ],
      },
    ],
  },
  {
    unit: 15,
    title: "Testing & QA",
    topics: [
      {
        slug: "third-conditional",
        title: "Third Conditional",
        order: 1,
        readingText:
          "If we had written more tests, we would have caught the bug earlier.\nThe outage would not have happened if someone had checked the config.\nIf QA had received the build on time, they would have finished testing by Friday.\nWe would have saved hours if we had automated the regression suite.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "If we _____ the edge cases, the app _____ in production.",
            payload: {
              options: [
                { id: "a", text: "had tested / wouldn't have crashed" },
                { id: "b", text: "tested / wouldn't crash" },
                { id: "c", text: "had tested / wouldn't crash" },
                { id: "d", text: "would test / hadn't crashed" },
              ],
              correctAnswerId: "a",
              explanation:
                "Third Conditional: If + Past Perfect, would have + past participle.",
            },
            difficulty: 3,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "She _____ the bug if she _____ the logs more carefully.",
            payload: {
              options: [
                { id: "a", text: "would have noticed / had read" },
                { id: "b", text: "noticed / had read" },
                { id: "c", text: "would notice / read" },
                { id: "d", text: "had noticed / would have read" },
              ],
              correctAnswerId: "a",
              explanation: "Unreal past → would have noticed / had read.",
            },
            difficulty: 3,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "If the tests _____ (run) before merge, the build wouldn't have broken.",
            payload: {
              text: "If the tests _____ before merge, the build wouldn't have broken.",
              correctAnswers: ["had run", "had been run"],
              explanation: "If-clause in Third Conditional → Past Perfect.",
            },
            difficulty: 3,
          },
          {
            type: "TRUE_FALSE",
            prompt: "Third Conditional talks about real future possibilities.",
            payload: {
              correctAnswer: false,
              explanation:
                "No — it describes unreal PAST situations and their imaginary results.",
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "mixed-conditionals",
        title: "Mixed Conditionals",
        order: 2,
        readingText:
          "If I had learned automation earlier, I would be a QA lead now.\nIf our coverage were better, yesterday's release would not have failed.\nIf the team hadn't skipped code review, we wouldn't be fixing this mess today.\nIf testing were taken seriously here, the incident would have been prevented.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "If I _____ that course last year, I _____ for this QA position now.",
            payload: {
              options: [
                { id: "a", text: "had taken / would be ready" },
                { id: "b", text: "took / would have been ready" },
                { id: "c", text: "had taken / would have been ready" },
                { id: "d", text: "take / will be ready" },
              ],
              correctAnswerId: "a",
              explanation:
                "Past condition → present result: If + Past Perfect, would + base verb (now).",
            },
            difficulty: 4,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "If she _____ so busy, she _____ the release yesterday.",
            payload: {
              options: [
                { id: "a", text: "weren't / would have checked" },
                { id: "b", text: "isn't / would check" },
                { id: "c", text: "hadn't been / would check" },
                { id: "d", text: "weren't / will check" },
              ],
              correctAnswerId: "a",
              explanation:
                "Present condition → past result: If + Past Simple, would have + participle.",
            },
            difficulty: 4,
          },
          {
            type: "FILL_IN_BLANK",
            prompt:
              "If we _____ (not/ignore) the warnings back then, we wouldn't have this technical debt today.",
            payload: {
              text: "If we _____ the warnings back then, we wouldn't have this technical debt today.",
              correctAnswers: ["hadn't ignored", "had not ignored"],
              explanation: "Past condition with present result → Past Perfect negative.",
            },
            difficulty: 4,
          },
          {
            type: "TRUE_FALSE",
            prompt: "Mixed conditionals combine different times in the condition and the result.",
            payload: {
              correctAnswer: true,
              explanation: "Yes: e.g. past condition → present result.",
            },
            difficulty: 2,
          },
        ],
      },
    ],
  },
  {
    unit: 16,
    title: "DevOps",
    topics: [
      {
        slug: "past-perfect",
        title: "Past Perfect",
        order: 1,
        readingText:
          "By the time the team arrived, the pipeline had already failed three times.\nThe admin realized someone had changed the config without approval.\nWe had never used containers before we adopted Docker in 2020.\nAfter we had containerized the services, deployments became much easier.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "When I checked the dashboard, the deploy _____ already _____ .",
            payload: {
              options: [
                { id: "a", text: "had / finished" },
                { id: "b", text: "has / finished" },
                { id: "c", text: "was / finished" },
                { id: "d", text: "did / finish" },
              ],
              correctAnswerId: "a",
              explanation:
                "Action completed before another past action → Past Perfect (had + participle).",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The service crashed because someone _____ the environment variable.",
            payload: {
              options: [
                { id: "a", text: "had deleted" },
                { id: "b", text: "has deleted" },
                { id: "c", text: "deletes" },
                { id: "d", text: "was deleting" },
              ],
              correctAnswerId: "a",
              explanation: "The deletion happened BEFORE the crash → Past Perfect.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "By midnight we _____ (restore) all the services.",
            payload: {
              text: "By midnight we _____ all the services.",
              correctAnswers: ["had restored"],
              explanation: '"By + past time" → Past Perfect.',
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: "Past Perfect describes an action that happened before another past action.",
            payload: {
              correctAnswer: true,
              explanation: "Yes — the «earlier past».",
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "used-to",
        title: "used to / would for Past Habits",
        order: 2,
        readingText:
          "We used to deploy manually every Friday night.\nThe team would spend hours copying files to the server.\nThere didn't use to be any automated tests at all.\nNow CI/CD does everything, and those long nights are history.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Before CI/CD, developers _____ merge code only once a month.",
            payload: {
              options: [
                { id: "a", text: "used to" },
                { id: "b", text: "use to" },
                { id: "c", text: "are used to" },
                { id: "d", text: "using to" },
              ],
              correctAnswerId: "a",
              explanation: "Past habit that no longer exists → used to + base verb.",
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "_____ you _____ work without version control?",
            payload: {
              options: [
                { id: "a", text: "Did / use to" },
                { id: "b", text: "Did / used to" },
                { id: "c", text: "Do / use to" },
                { id: "d", text: "Were / used to" },
              ],
              correctAnswerId: "a",
              explanation: 'Question: Did + use to (no -d after "did").',
            },
            difficulty: 3,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "There _____ (negative) use to be any monitoring in the old days.",
            payload: {
              text: "There _____ use to be any monitoring in the old days.",
              correctAnswers: ["didn't", "did not"],
              explanation: "Negative: didn't use to.",
            },
            difficulty: 2,
          },
          {
            type: "SPEAKING",
            prompt:
              "Compare how you studied or worked before and now. What did you use to do? What has changed? (4+ sentences with used to)",
            payload: {
              example:
                "I used to write code only in Notepad. I didn't use to know about version control. I would lose my files all the time. Now I use VS Code and Git every day.",
              explanation: "used to + base verb for past habits and states.",
            },
            difficulty: 2,
          },
        ],
      },
    ],
  },
  {
    unit: 17,
    title: "Tech Interviews",
    topics: [
      {
        slug: "indirect-questions",
        title: "Indirect Questions",
        order: 1,
        readingText:
          "Could you tell me what technologies you have worked with?\nI was wondering if you have any experience with microservices.\nDo you know how long the interview process takes?\nCan you explain why you want to change your job?",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Could you tell me where _____?",
            payload: {
              options: [
                { id: "a", text: "is the meeting room" },
                { id: "b", text: "the meeting room is" },
                { id: "c", text: "does the meeting room" },
                { id: "d", text: "the meeting room does" },
              ],
              correctAnswerId: "b",
              explanation:
                "Indirect questions use statement word order: where the meeting room is.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "I was wondering _____ you could send me the test task.",
            payload: {
              options: [
                { id: "a", text: "that" },
                { id: "b", text: "if" },
                { id: "c", text: "what" },
                { id: "d", text: "do" },
              ],
              correctAnswerId: "b",
              explanation: "Yes/no indirect question → if/whether.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: 'Direct: "When does the team have standups?" → Do you know when the team _____ standups?',
            payload: {
              text: "Do you know when the team _____ standups?",
              correctAnswers: ["has"],
              explanation:
                "No auxiliary «does» in indirect questions; verb returns to normal form.",
            },
            difficulty: 3,
          },
          {
            type: "TRUE_FALSE",
            prompt: "Indirect questions sound more polite than direct ones.",
            payload: {
              correctAnswer: true,
              explanation:
                "Yes — they are common in interviews and formal communication.",
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "phrasal-verbs-it",
        title: "Phrasal Verbs in IT",
        order: 2,
        readingText:
          "The server went down at noon, but we brought it back up quickly.\nWe need to figure out why the memory usage keeps going up.\nDon't put off writing tests until the last day.\nLet's set up a call to go over the requirements.",
        exercises: [
          {
            type: "MATCHING",
            prompt: "Match the phrasal verb with its meaning.",
            payload: {
              left: [
                { id: "1", text: "figure out" },
                { id: "2", text: "set up" },
                { id: "3", text: "go down" },
              ],
              right: [
                { id: "a", text: "stop working (about systems)" },
                { id: "b", text: "understand / find the answer" },
                { id: "c", text: "install, configure, arrange" },
              ],
              pairs: [
                ["1", "b"],
                ["2", "c"],
                ["3", "a"],
              ],
              explanation: "Common IT phrasal verbs.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "We need to _____ this bug before the demo.",
            payload: {
              options: [
                { id: "a", text: "sort out" },
                { id: "b", text: "sort up" },
                { id: "c", text: "sort off" },
                { id: "d", text: "sort down" },
              ],
              correctAnswerId: "a",
              explanation: '"Sort out" = solve, fix a problem.',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "The deployment failed, so we had to roll _____ to the previous version.",
            payload: {
              text: "The deployment failed, so we had to roll _____ to the previous version.",
              correctAnswers: ["back"],
              explanation: '"Roll back" = return to a previous version.',
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Answer a typical interview question: «Tell me about a difficult problem you solved.» Use at least 3 phrasal verbs (figure out, set up, sort out, go over, carry out...).",
            payload: {
              example:
                "Once our app kept crashing and I had to figure out why. I set up detailed logging and went over the error reports. Finally, I sorted out the problem — it was a memory leak.",
              explanation: "Phrasal verbs make your speech natural in interviews.",
            },
            difficulty: 3,
          },
        ],
      },
    ],
  },
  {
    unit: 18,
    title: "Career Development",
    topics: [
      {
        slug: "future-perfect-continuous",
        title: "Future Perfect & Future Continuous",
        order: 1,
        readingText:
          "By next June, I will have worked here for five years.\nThis time tomorrow, I will be presenting our roadmap to the board.\nBy the end of the year, we will have migrated all services to the cloud.\nDon't call at nine — I will be interviewing a candidate.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "By 2030, AI _____ most routine coding tasks.",
            payload: {
              options: [
                { id: "a", text: "will have automated" },
                { id: "b", text: "will be automated" },
                { id: "c", text: "automates" },
                { id: "d", text: "will automating" },
              ],
              correctAnswerId: "a",
              explanation:
                "Completed by a future point («by 2030») → Future Perfect: will have + participle.",
            },
            difficulty: 3,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "This time next week, I _____ at my new job.",
            payload: {
              options: [
                { id: "a", text: "will be working" },
                { id: "b", text: "will have worked" },
                { id: "c", text: "work" },
                { id: "d", text: "am working" },
              ],
              correctAnswerId: "a",
              explanation:
                "Action in progress at a future moment → Future Continuous: will be + -ing.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "By December, she _____ (complete) all the certification exams.",
            payload: {
              text: "By December, she _____ all the certification exams.",
              correctAnswers: ["will have completed"],
              explanation: "«By + future time» → Future Perfect.",
            },
            difficulty: 3,
          },
          {
            type: "TRUE_FALSE",
            prompt: "Future Continuous is formed with «will be + verb-ing».",
            payload: {
              correctAnswer: true,
              explanation: "Correct: will be working, will be presenting.",
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "wish-clauses",
        title: "Wishes and Regrets: I wish / If only",
        order: 2,
        readingText:
          "I wish I knew system design better — it comes up in every senior interview.\nIf only I had started contributing to open source earlier.\nShe wishes her company offered more learning opportunities.\nI wish I hadn't turned down that startup offer two years ago.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "I wish I _____ more programming languages. (present regret)",
            payload: {
              options: [
                { id: "a", text: "know" },
                { id: "b", text: "knew" },
                { id: "c", text: "had known" },
                { id: "d", text: "will know" },
              ],
              correctAnswerId: "b",
              explanation: "Wish about the present → Past Simple: I wish I knew.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "If only I _____ that job offer last year! (past regret)",
            payload: {
              options: [
                { id: "a", text: "accepted" },
                { id: "b", text: "had accepted" },
                { id: "c", text: "accept" },
                { id: "d", text: "would accept" },
              ],
              correctAnswerId: "b",
              explanation: "Regret about the past → Past Perfect: If only I had accepted.",
            },
            difficulty: 3,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She wishes she _____ (not/delete) that repository.",
            payload: {
              text: "She wishes she _____ that repository.",
              correctAnswers: ["hadn't deleted", "had not deleted"],
              explanation: "Past regret → Past Perfect negative.",
            },
            difficulty: 3,
          },
          {
            type: "SPEAKING",
            prompt:
              "Talk about your IT career: one thing you wish you knew now, one past regret (I wish I had...), and your plans. 4+ sentences.",
            payload: {
              example:
                "I wish I knew more about algorithms. I wish I had started learning English earlier. If only I had more time for side projects! Next year I am going to apply for an internship.",
              explanation: "wish + Past Simple (present), wish + Past Perfect (past).",
            },
            difficulty: 3,
          },
        ],
      },
    ],
  },
];
