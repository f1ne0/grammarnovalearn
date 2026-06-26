import { SeedUnit } from "./types";

export const UNITS_7_12: SeedUnit[] = [
  {
    unit: 7,
    title: "Databases",
    topics: [
      {
        slug: "comparatives",
        title: "Comparative Adjectives",
        order: 1,
        readingText:
          "PostgreSQL is more flexible than many other databases for complex queries.\nAn indexed search is faster than a full table scan.\nNoSQL databases are often simpler to scale horizontally.\nHowever, relational databases are usually better for transactional data.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "An SSD is much _____ than a traditional hard drive.",
            payload: {
              options: [
                { id: "a", text: "fast" },
                { id: "b", text: "faster" },
                { id: "c", text: "more fast" },
                { id: "d", text: "fastest" },
              ],
              correctAnswerId: "b",
              explanation: "Short adjective → -er: fast → faster.",
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "This query is _____ than the previous one.",
            payload: {
              options: [
                { id: "a", text: "more efficient" },
                { id: "b", text: "efficienter" },
                { id: "c", text: "most efficient" },
                { id: "d", text: "efficient" },
              ],
              correctAnswerId: "a",
              explanation: "Long adjective (3+ syllables) → more + adjective.",
            },
            difficulty: 1,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "The new schema is _____ (good) than the old one.",
            payload: {
              text: "The new schema is _____ than the old one.",
              correctAnswers: ["better"],
              explanation: "Irregular comparative: good → better.",
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt: 'The comparative of "bad" is "badder".',
            payload: {
              correctAnswer: false,
              explanation: "Irregular: bad → worse.",
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "superlatives",
        title: "Superlative Adjectives",
        order: 2,
        readingText:
          "Choosing the right index is the most important optimization step.\nThis is the largest table in our database, with two billion rows.\nThe simplest solution is often the best one.\nOur slowest query used to take ten seconds before we optimized it.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "This is _____ database migration we have ever done.",
            payload: {
              options: [
                { id: "a", text: "the most complex" },
                { id: "b", text: "the complexest" },
                { id: "c", text: "more complex" },
                { id: "d", text: "most complex" },
              ],
              correctAnswerId: "a",
              explanation: "Superlative of long adjectives: the most + adjective.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Friday deploys cause _____ problems of all.",
            payload: {
              options: [
                { id: "a", text: "the worst" },
                { id: "b", text: "the baddest" },
                { id: "c", text: "worse" },
                { id: "d", text: "the most bad" },
              ],
              correctAnswerId: "a",
              explanation: "Irregular superlative: bad → the worst.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "It was the _____ (easy) bug fix of the sprint.",
            payload: {
              text: "It was the _____ bug fix of the sprint.",
              correctAnswers: ["easiest"],
              explanation: "Adjective ending in -y → -iest: easy → easiest.",
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Compare three technologies you know (languages, databases, frameworks). Which is the fastest, the easiest, the most powerful? Use comparatives and superlatives.",
            payload: {
              example:
                "I know Python, JavaScript and C++. Python is the easiest to learn. C++ is faster than Python, and it is the most powerful for system programming. JavaScript is more popular for web development.",
              explanation: "Use -er/more for comparing two, the -est/the most for three or more.",
            },
            difficulty: 3,
          },
        ],
      },
    ],
  },
  {
    unit: 8,
    title: "Web Development",
    topics: [
      {
        slug: "present-perfect",
        title: "Present Perfect",
        order: 1,
        readingText:
          "We have just deployed the new landing page.\nOur team has worked on this redesign for three months.\nI have never seen such positive user feedback before.\nThe designers have already started the next iteration.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "I _____ already _____ the pull request.",
            payload: {
              options: [
                { id: "a", text: "have / merged" },
                { id: "b", text: "has / merged" },
                { id: "c", text: "did / merge" },
                { id: "d", text: "have / merge" },
              ],
              correctAnswerId: "a",
              explanation: "Present Perfect: have/has + past participle; «already» is a typical marker.",
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "_____ you ever _____ with WebSockets?",
            payload: {
              options: [
                { id: "a", text: "Did / work" },
                { id: "b", text: "Have / worked" },
                { id: "c", text: "Has / worked" },
                { id: "d", text: "Do / work" },
              ],
              correctAnswerId: "b",
              explanation: 'Life experience ("ever") → Present Perfect.',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She _____ (build) five production websites so far.",
            payload: {
              text: "She _____ five production websites so far.",
              correctAnswers: ["has built"],
              explanation: '"So far" → Present Perfect: has + built (irregular).',
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: 'In the sentence "I have worked here since 2022", "since" marks the starting point.',
            payload: {
              correctAnswer: true,
              explanation: "Since + starting point; for + duration (for two years).",
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "present-perfect-vs-past",
        title: "Present Perfect vs Past Simple",
        order: 2,
        readingText:
          "I have fixed the bug — the site works now.\nI fixed it yesterday evening after the standup.\nWe have released three versions this year.\nLast year we released only one version.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "We _____ the API last week.",
            payload: {
              options: [
                { id: "a", text: "have updated" },
                { id: "b", text: "updated" },
                { id: "c", text: "has updated" },
                { id: "d", text: "update" },
              ],
              correctAnswerId: "b",
              explanation: 'Finished time ("last week") → Past Simple.',
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Sorry, I can't reproduce the bug — they _____ it already.",
            payload: {
              options: [
                { id: "a", text: "fixed" },
                { id: "b", text: "have fixed" },
                { id: "c", text: "fix" },
                { id: "d", text: "were fixing" },
              ],
              correctAnswerId: "b",
              explanation:
                "Result is relevant now → Present Perfect.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "_____ you _____ (see) the new docs yet? (Present Perfect)",
            payload: {
              text: "_____ you _____ the new docs yet?",
              correctAnswers: ["have seen", "have / seen"],
              explanation: '"Yet" in questions → Present Perfect: Have you seen...?',
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: 'We can say "I have seen him yesterday."',
            payload: {
              correctAnswer: false,
              explanation:
                'Specific finished time ("yesterday") requires Past Simple: "I saw him yesterday."',
            },
            difficulty: 2,
          },
        ],
      },
    ],
  },
  {
    unit: 9,
    title: "Mobile Technologies",
    topics: [
      {
        slug: "will-going-to",
        title: "Future: will / be going to",
        order: 1,
        readingText:
          "Next quarter we are going to rewrite the app in Flutter.\nThe team has planned everything: we will start with the login module.\nI think users will love the new offline mode.\nLook at this crash rate — the release is going to be a challenge.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "We have already decided: we _____ React Native for the new app.",
            payload: {
              options: [
                { id: "a", text: "will use" },
                { id: "b", text: "are going to use" },
                { id: "c", text: "use" },
                { id: "d", text: "used" },
              ],
              correctAnswerId: "b",
              explanation: "A plan/decision made before → be going to.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The Wi-Fi is down? OK, I _____ switch to mobile data.",
            payload: {
              options: [
                { id: "a", text: "am going to" },
                { id: "b", text: "will" },
                { id: "c", text: "going to" },
                { id: "d", text: "am" },
              ],
              correctAnswerId: "b",
              explanation: "Spontaneous decision at the moment of speaking → will.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "I promise the fix _____ (be) ready by Monday.",
            payload: {
              text: "I promise the fix _____ ready by Monday.",
              correctAnswers: ["will be"],
              explanation: "Promises → will.",
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Talk about your plans in IT for the next year. What are you going to learn? What do you think will change in technology? (4+ sentences)",
            payload: {
              example:
                "Next year I am going to learn mobile development. I am going to build my first Android app. I think AI tools will become even more popular. Maybe I will find an internship in a tech company.",
              explanation: "Use «going to» for plans, «will» for predictions and promises.",
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "present-continuous-future",
        title: "Present Continuous for Future Arrangements",
        order: 2,
        readingText:
          "We are meeting the client tomorrow at 10 am.\nThe designer is presenting the new mockups on Thursday.\nI am flying to the conference next weekend.\nOur team is releasing the beta version on the first of next month.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "We _____ the stakeholders on Friday — it is already in the calendar.",
            payload: {
              options: [
                { id: "a", text: "meet" },
                { id: "b", text: "are meeting" },
                { id: "c", text: "will meeting" },
                { id: "d", text: "met" },
              ],
              correctAnswerId: "b",
              explanation:
                "Fixed arrangement with time/place → Present Continuous for future.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "What time _____ the demo _____ tomorrow?",
            payload: {
              options: [
                { id: "a", text: "is / starting" },
                { id: "b", text: "does / starting" },
                { id: "c", text: "will / starting" },
                { id: "d", text: "is / start" },
              ],
              correctAnswerId: "a",
              explanation: "Arrangement question → Present Continuous: is starting.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She _____ (interview) two candidates this afternoon.",
            payload: {
              text: "She _____ two candidates this afternoon.",
              correctAnswers: ["is interviewing"],
              explanation: "Scheduled arrangement → Present Continuous.",
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt:
              "Present Continuous for the future is used for personal arrangements with a fixed time.",
            payload: {
              correctAnswer: true,
              explanation:
                "Yes — typically things written in a diary/calendar: meetings, flights, appointments.",
            },
            difficulty: 1,
          },
        ],
      },
    ],
  },
  {
    unit: 10,
    title: "Cybersecurity",
    topics: [
      {
        slug: "modals-obligation",
        title: "Modals of Obligation: must / have to / mustn't",
        order: 1,
        readingText:
          "All employees must use two-factor authentication.\nYou have to change your password every ninety days.\nYou mustn't share your credentials with anyone.\nContractors don't have to attend the security training, but it is recommended.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "You _____ write your password on a sticky note. It is forbidden.",
            payload: {
              options: [
                { id: "a", text: "must" },
                { id: "b", text: "mustn't" },
                { id: "c", text: "don't have to" },
                { id: "d", text: "have to" },
              ],
              correctAnswerId: "b",
              explanation: "Prohibition → mustn't.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Interns _____ work on weekends — it is optional.",
            payload: {
              options: [
                { id: "a", text: "mustn't" },
                { id: "b", text: "don't have to" },
                { id: "c", text: "must" },
                { id: "d", text: "can't" },
              ],
              correctAnswerId: "b",
              explanation:
                "No obligation (optional) → don't have to. Mustn't = prohibited!",
            },
            difficulty: 3,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "Everyone _____ (obligation) lock their screen when leaving the desk.",
            payload: {
              text: "Everyone _____ lock their screen when leaving the desk.",
              correctAnswers: ["must", "has to"],
              explanation: "Strong obligation → must / has to.",
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt: '"Mustn\'t" and "don\'t have to" mean the same thing.',
            payload: {
              correctAnswer: false,
              explanation:
                "Mustn't = prohibition (don't do it!). Don't have to = no obligation (you can choose).",
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "modals-advice",
        title: "Modals of Advice: should / ought to / had better",
        order: 2,
        readingText:
          "You should update your antivirus regularly.\nDevelopers ought to review security advisories every week.\nYou had better back up the database before running this script.\nUsers shouldn't click on links from unknown senders.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "You _____ use the same password for every account.",
            payload: {
              options: [
                { id: "a", text: "should" },
                { id: "b", text: "shouldn't" },
                { id: "c", text: "ought" },
                { id: "d", text: "had better to" },
              ],
              correctAnswerId: "b",
              explanation: "Negative advice → shouldn't.",
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "You _____ back up your data before the migration, or you may lose it.",
            payload: {
              options: [
                { id: "a", text: "had better" },
                { id: "b", text: "had better to" },
                { id: "c", text: "would better" },
                { id: "d", text: "have better" },
              ],
              correctAnswerId: "a",
              explanation:
                "Had better + base verb (no «to») — strong advice with a warning.",
            },
            difficulty: 3,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "Developers _____ (advice) enable 2FA on GitHub.",
            payload: {
              text: "Developers _____ enable 2FA on GitHub.",
              correctAnswers: ["should", "ought to"],
              explanation: "Advice → should / ought to.",
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Give 4-5 pieces of security advice to a new employee. Use should, shouldn't, must, mustn't.",
            payload: {
              example:
                "You should create a strong unique password. You must enable two-factor authentication. You shouldn't open suspicious attachments. You mustn't share your access card with anyone.",
              explanation: "Mix modals of advice and obligation.",
            },
            difficulty: 2,
          },
        ],
      },
    ],
  },
  {
    unit: 11,
    title: "Cloud Computing",
    topics: [
      {
        slug: "first-conditional",
        title: "First Conditional",
        order: 1,
        readingText:
          "If the traffic grows, the autoscaler will add more instances.\nIf you exceed the free tier, you will receive a bill.\nThe system will send an alert if CPU usage stays above ninety percent.\nIf we move to the cloud, we won't need our own server room.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "If the deployment _____, the system _____ back automatically.",
            payload: {
              options: [
                { id: "a", text: "fails / will roll" },
                { id: "b", text: "will fail / rolls" },
                { id: "c", text: "fails / rolls" },
                { id: "d", text: "will fail / will roll" },
              ],
              correctAnswerId: "a",
              explanation:
                "First Conditional: If + Present Simple, will + base verb.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "You _____ extra costs if you _____ those unused instances.",
            payload: {
              options: [
                { id: "a", text: "will avoid / stop" },
                { id: "b", text: "avoid / will stop" },
                { id: "c", text: "will avoid / will stop" },
                { id: "d", text: "avoided / stop" },
              ],
              correctAnswerId: "a",
              explanation: "Main clause: will + verb; if-clause: Present Simple.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "If the region goes down, traffic _____ (switch) to the backup region.",
            payload: {
              text: "If the region goes down, traffic _____ to the backup region.",
              correctAnswers: ["will switch"],
              explanation: "Real future condition → will + base verb in the main clause.",
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt: 'In First Conditional we say "If it will rain..."',
            payload: {
              correctAnswer: false,
              explanation: 'No "will" after "if": If it rains, we will stay inside.',
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "second-conditional",
        title: "Second Conditional",
        order: 2,
        readingText:
          "If we had an unlimited budget, we would run everything on dedicated servers.\nIf the latency were lower, users would not complain.\nI would choose serverless if I started this project today.\nIf you knew Kubernetes, you would understand our setup easily.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "If I _____ you, I _____ those API keys immediately.",
            payload: {
              options: [
                { id: "a", text: "were / would rotate" },
                { id: "b", text: "am / will rotate" },
                { id: "c", text: "was / will rotate" },
                { id: "d", text: "were / rotate" },
              ],
              correctAnswerId: "a",
              explanation:
                'Second Conditional (hypothetical): If + Past Simple, would + verb. "If I were you" is the set phrase for advice.',
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "If our app _____ a million users, we _____ a bigger cluster.",
            payload: {
              options: [
                { id: "a", text: "had / would need" },
                { id: "b", text: "has / will need" },
                { id: "c", text: "had / will need" },
                { id: "d", text: "would have / needed" },
              ],
              correctAnswerId: "a",
              explanation: "Unreal present situation → Second Conditional.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "If cloud storage _____ (be) free, everyone would use it for everything.",
            payload: {
              text: "If cloud storage _____ free, everyone would use it for everything.",
              correctAnswers: ["were", "was"],
              explanation: 'Hypothetical → Past Simple; "were" is preferred for all persons.',
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: "Second Conditional describes unreal or unlikely present/future situations.",
            payload: {
              correctAnswer: true,
              explanation: "Yes — hypothetical situations: If I had..., I would...",
            },
            difficulty: 1,
          },
        ],
      },
    ],
  },
  {
    unit: 12,
    title: "AI & Machine Learning",
    topics: [
      {
        slug: "passive-present",
        title: "Passive Voice: Present",
        order: 1,
        readingText:
          "The model is trained on millions of examples.\nUser data is anonymized before processing.\nPredictions are generated in real time.\nThe results are evaluated by a team of experts every week.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The dataset _____ automatically every night.",
            payload: {
              options: [
                { id: "a", text: "updates is" },
                { id: "b", text: "is updated" },
                { id: "c", text: "is updating" },
                { id: "d", text: "updated" },
              ],
              correctAnswerId: "b",
              explanation: "Present Simple Passive: is/are + past participle.",
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Millions of images _____ to train this neural network.",
            payload: {
              options: [
                { id: "a", text: "is used" },
                { id: "b", text: "are used" },
                { id: "c", text: "are using" },
                { id: "d", text: "use" },
              ],
              correctAnswerId: "b",
              explanation: "Plural subject → are + past participle.",
            },
            difficulty: 1,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "The output _____ (check) by a human reviewer before publication.",
            payload: {
              text: "The output _____ by a human reviewer before publication.",
              correctAnswers: ["is checked"],
              explanation: "Present Passive: is + checked. «By» introduces the agent.",
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: "We use the passive voice when the action is more important than who does it.",
            payload: {
              correctAnswer: true,
              explanation:
                "Exactly — typical for technical and scientific descriptions.",
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "passive-past",
        title: "Passive Voice: Past",
        order: 2,
        readingText:
          "The first neural networks were developed decades ago.\nThe term 'machine learning' was coined in 1959.\nOur recommendation engine was launched last spring.\nThousands of edge cases were discovered during testing.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The bug in the training script _____ by an intern.",
            payload: {
              options: [
                { id: "a", text: "was found" },
                { id: "b", text: "were found" },
                { id: "c", text: "found" },
                { id: "d", text: "is find" },
              ],
              correctAnswerId: "a",
              explanation: "Past Simple Passive: was/were + past participle.",
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "When _____ this model _____ ?",
            payload: {
              options: [
                { id: "a", text: "was / trained" },
                { id: "b", text: "did / trained" },
                { id: "c", text: "was / train" },
                { id: "d", text: "is / trained" },
              ],
              correctAnswerId: "a",
              explanation: "Passive question: When was it trained?",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "The results _____ (publish) in a research paper last year.",
            payload: {
              text: "The results _____ in a research paper last year.",
              correctAnswers: ["were published"],
              explanation: "Plural + past → were published.",
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Describe how an AI product is built: what is done at each stage? Use passive voice (is collected, was trained, are tested...). 4+ sentences.",
            payload: {
              example:
                "First, the data is collected from many sources. Then it is cleaned and labeled. The model is trained on powerful servers. Finally, the results are evaluated and the model is deployed.",
              explanation: "Passive voice describes processes without naming the doer.",
            },
            difficulty: 3,
          },
        ],
      },
    ],
  },
];
