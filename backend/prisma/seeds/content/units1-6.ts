import { SeedUnit } from "./types";

export const UNITS_1_6: SeedUnit[] = [
  {
    unit: 1,
    title: "Working in IT",
    topics: [
      {
        slug: "present-simple",
        title: "Present Simple Tense",
        order: 1,
        readingText:
          "A software developer works for a technology company.\nShe designs applications for mobile devices.\nEvery day, she codes, tests, and debugs software.\nShe also communicates with her team about project requirements.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt:
              "A software developer _____ (work) for a technology company.",
            payload: {
              options: [
                { id: "a", text: "work" },
                { id: "b", text: "works" },
                { id: "c", text: "is working" },
                { id: "d", text: "working" },
              ],
              correctAnswerId: "b",
              explanation:
                'We use Present Simple for habitual or general truths. With "he/she/it", we add -s to the verb.',
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt:
              "Every day, she _____ (code), (test), and (debug) software.",
            payload: {
              options: [
                { id: "a", text: "code, tests, debugs" },
                { id: "b", text: "codes, test, debug" },
                { id: "c", text: "codes, tests, debugs" },
                { id: "d", text: "coding, testing, debugging" },
              ],
              correctAnswerId: "c",
              explanation:
                'All verbs in the same sentence should agree with the subject "she".',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt:
              "Software developers _____ with databases and applications.",
            payload: {
              text: "Software developers _____ with databases and applications.",
              correctAnswers: ["work", "work together"],
              explanation: 'Present Simple with plural subject "developers".',
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Describe your typical workday as an IT student or developer. Use at least 4 sentences in Present Simple.",
            payload: {
              example:
                "I wake up at 7 am and check my emails. I study programming every morning. In the afternoon, I work on my projects. I usually finish my day by reading tech articles.",
              explanation:
                "Use Present Simple for daily routines and habitual actions.",
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "nouns-plural",
        title: "Singular and Plural Nouns",
        order: 2,
        readingText:
          "In an IT department, there are many computers and servers.\nSoftware developers use keyboards and mice.\nThey work with databases and applications.\nTeams include specialists in different areas.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "What is the plural of «mouse» (the device)?",
            payload: {
              options: [
                { id: "a", text: "mouses" },
                { id: "b", text: "mice" },
                { id: "c", text: "mousees" },
                { id: "d", text: "mouse" },
              ],
              correctAnswerId: "b",
              explanation:
                '"Mouse" has an irregular plural: mice. For computer devices both "mice" and "mouses" appear in usage, but "mice" is standard.',
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The team installed three new _____ in the data center.",
            payload: {
              options: [
                { id: "a", text: "server" },
                { id: "b", text: "servers" },
                { id: "c", text: "serveres" },
                { id: "d", text: "server's" },
              ],
              correctAnswerId: "b",
              explanation:
                "Regular plural: add -s. Apostrophe -'s shows possession, not plural.",
            },
            difficulty: 1,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "Plural of «process»: We run several background _____ .",
            payload: {
              text: "We run several background _____ .",
              correctAnswers: ["processes"],
              explanation:
                "Nouns ending in -s, -ss, -sh, -ch, -x take -es in plural.",
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt:
              '«Software» is a countable noun, so we can say "two softwares".',
            payload: {
              correctAnswer: false,
              explanation:
                '"Software" is uncountable. Say "two programs" or "two pieces of software".',
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "personality-adjectives",
        title: "Personality Adjectives in IT",
        order: 3,
        readingText:
          "Good software developers are responsible and creative.\nThey must be organized, patient, and hardworking.\nCommunication skills are important for team members.\nSuccessful teams have dedicated and motivated professionals.",
        exercises: [
          {
            type: "MATCHING",
            prompt: "Match the adjective with its meaning.",
            payload: {
              left: [
                { id: "1", text: "reliable" },
                { id: "2", text: "creative" },
                { id: "3", text: "patient" },
              ],
              right: [
                { id: "a", text: "full of new ideas" },
                { id: "b", text: "able to wait calmly" },
                { id: "c", text: "can always be trusted" },
              ],
              pairs: [
                ["1", "c"],
                ["2", "a"],
                ["3", "b"],
              ],
              explanation: "Personality adjectives describe character traits.",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "A developer who always meets deadlines is very _____ .",
            payload: {
              options: [
                { id: "a", text: "lazy" },
                { id: "b", text: "dependable" },
                { id: "c", text: "careless" },
                { id: "d", text: "impatient" },
              ],
              correctAnswerId: "b",
              explanation: '"Dependable" = reliable, someone you can count on.',
            },
            difficulty: 1,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "Someone who works a lot and with effort is hard_____ .",
            payload: {
              text: "Someone who works a lot and with effort is hard_____ .",
              correctAnswers: ["working", "-working"],
              explanation: 'Compound adjective: "hardworking".',
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt: '"Organized" and "organised" are both correct spellings.',
            payload: {
              correctAnswer: true,
              explanation:
                '"Organized" is American English, "organised" is British English.',
            },
            difficulty: 1,
          },
        ],
      },
    ],
  },
  {
    unit: 2,
    title: "Your Workplace",
    topics: [
      {
        slug: "there-is-are",
        title: "There is / There are",
        order: 1,
        readingText:
          "There is a large open space in our office.\nThere are twenty desks and two meeting rooms.\nThere is a server room next to the kitchen.\nThere are no private offices, but there is a quiet zone for focused work.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "_____ a standing desk in the corner of the office.",
            payload: {
              options: [
                { id: "a", text: "There are" },
                { id: "b", text: "There is" },
                { id: "c", text: "There be" },
                { id: "d", text: "Is there" },
              ],
              correctAnswerId: "b",
              explanation: 'Singular noun ("a standing desk") → "There is".',
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "_____ any monitors left in the storage room?",
            payload: {
              options: [
                { id: "a", text: "Is there" },
                { id: "b", text: "Are there" },
                { id: "c", text: "There are" },
                { id: "d", text: "There is" },
              ],
              correctAnswerId: "b",
              explanation: 'Plural noun in a question → "Are there ...?"',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "There _____ three meeting rooms on this floor.",
            payload: {
              text: "There _____ three meeting rooms on this floor.",
              correctAnswers: ["are"],
              explanation: 'Plural ("three meeting rooms") → "are".',
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Describe your workplace or study room. Use «there is / there are» at least 4 times.",
            payload: {
              example:
                "There is a big desk near the window. There are two monitors on it. There is a comfortable chair. There are some books about programming on the shelf.",
              explanation:
                "Use «there is» for singular and «there are» for plural.",
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "prepositions-of-place",
        title: "Prepositions of Place",
        order: 2,
        readingText:
          "The router is on the shelf above the printer.\nThe cables run under the floor between the desks.\nMy laptop is next to the external monitor.\nThe backup server is in the rack behind the glass door.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt:
              "The USB drive is _____ the laptop. (touching its top surface)",
            payload: {
              options: [
                { id: "a", text: "in" },
                { id: "b", text: "on" },
                { id: "c", text: "at" },
                { id: "d", text: "under" },
              ],
              correctAnswerId: "b",
              explanation: '"On" = on the surface of something.',
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The server room is _____ the second floor.",
            payload: {
              options: [
                { id: "a", text: "in" },
                { id: "b", text: "at" },
                { id: "c", text: "on" },
                { id: "d", text: "by" },
              ],
              correctAnswerId: "c",
              explanation: 'We say "on the first/second floor".',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt:
              "The printer stands _____ the two desks. (in the middle of)",
            payload: {
              text: "The printer stands _____ the two desks.",
              correctAnswers: ["between"],
              explanation: '"Between" = in the space separating two things.',
            },
            difficulty: 1,
          },
          {
            type: "REORDER",
            prompt: "Put the words in the correct order.",
            payload: {
              words: ["is", "the", "monitor", "next to", "keyboard", "the"],
              correctOrder: [
                "the",
                "monitor",
                "is",
                "next to",
                "the",
                "keyboard",
              ],
              explanation: "Subject + verb + preposition of place + object.",
            },
            difficulty: 2,
          },
        ],
      },
    ],
  },
  {
    unit: 3,
    title: "Job Responsibilities",
    topics: [
      {
        slug: "present-continuous",
        title: "Present Continuous",
        order: 1,
        readingText:
          "Right now, our team is preparing a new release.\nAnna is fixing a critical bug in the payment module.\nTwo engineers are reviewing the pull requests.\nI am writing documentation for the new API.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Look! The build _____ again. We need to check the logs.",
            payload: {
              options: [
                { id: "a", text: "fails" },
                { id: "b", text: "is failing" },
                { id: "c", text: "fail" },
                { id: "d", text: "failed" },
              ],
              correctAnswerId: "b",
              explanation:
                '"Look!" signals an action happening now → Present Continuous.',
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "What _____ on at the moment?",
            payload: {
              options: [
                { id: "a", text: "do you work" },
                { id: "b", text: "are you working" },
                { id: "c", text: "you are working" },
                { id: "d", text: "you work" },
              ],
              correctAnswerId: "b",
              explanation:
                'Question about "now" → Present Continuous with inverted word order.',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She _____ (test) the new feature right now.",
            payload: {
              text: "She _____ the new feature right now.",
              correctAnswers: ["is testing"],
              explanation: "Present Continuous: am/is/are + verb-ing.",
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Imagine you are in the middle of a working day. Describe what you and your teammates are doing right now (at least 4 sentences in Present Continuous).",
            payload: {
              example:
                "I am debugging the login page. My teammate is writing unit tests. Our designer is preparing new mockups. The manager is talking to a client.",
              explanation:
                "Present Continuous describes actions in progress now.",
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "simple-vs-continuous",
        title: "Present Simple vs Present Continuous",
        order: 2,
        readingText:
          "I usually work on backend services, but this week I am helping the mobile team.\nOur app normally handles a thousand requests per minute.\nToday it is handling three times more because of the sale.\nWe always monitor performance, and right now we are watching the dashboards closely.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "I usually _____ Python, but today I _____ Go.",
            payload: {
              options: [
                { id: "a", text: "use / am using" },
                { id: "b", text: "am using / use" },
                { id: "c", text: "use / use" },
                { id: "d", text: "am using / am using" },
              ],
              correctAnswerId: "a",
              explanation:
                '"Usually" → Present Simple; "today" (temporary) → Present Continuous.',
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "Which sentence is correct?",
            payload: {
              options: [
                { id: "a", text: "I am knowing the answer." },
                { id: "b", text: "I know the answer." },
                { id: "c", text: "I knowing the answer." },
                { id: "d", text: "I am know the answer." },
              ],
              correctAnswerId: "b",
              explanation:
                "State verbs (know, like, need, want) are not normally used in Continuous.",
            },
            difficulty: 3,
          },
          {
            type: "FILL_IN_BLANK",
            prompt:
              "Our server _____ (restart) automatically every night at 3 am.",
            payload: {
              text: "Our server _____ automatically every night at 3 am.",
              correctAnswers: ["restarts"],
              explanation: 'Routine/schedule ("every night") → Present Simple.',
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt:
              'The sentence "She is working from home this month" describes a temporary situation.',
            payload: {
              correctAnswer: true,
              explanation:
                "Present Continuous with time expressions like «this month» describes temporary arrangements.",
            },
            difficulty: 1,
          },
        ],
      },
    ],
  },
  {
    unit: 4,
    title: "Hardware",
    topics: [
      {
        slug: "countable-uncountable",
        title: "Countable and Uncountable Nouns",
        order: 1,
        readingText:
          "This workstation has plenty of memory and storage.\nWe ordered some new equipment for the lab: five laptops and three printers.\nThe technician gave us useful advice about cooling.\nHow much RAM does your computer have, and how many USB ports?",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "How _____ RAM does this laptop have?",
            payload: {
              options: [
                { id: "a", text: "many" },
                { id: "b", text: "much" },
                { id: "c", text: "few" },
                { id: "d", text: "lot" },
              ],
              correctAnswerId: "b",
              explanation: 'RAM/memory is uncountable → "how much".',
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "We need to buy some new _____ for the office.",
            payload: {
              options: [
                { id: "a", text: "equipments" },
                { id: "b", text: "equipment" },
                { id: "c", text: "an equipment" },
                { id: "d", text: "equipmentes" },
              ],
              correctAnswerId: "b",
              explanation: '"Equipment" is uncountable: no plural, no "a/an".',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt:
              "There are too _____ open tabs in your browser. (countable, a large number)",
            payload: {
              text: "There are too _____ open tabs in your browser.",
              correctAnswers: ["many"],
              explanation: 'Countable plural → "many".',
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt: '"Information" can be used in the plural: "informations".',
            payload: {
              correctAnswer: false,
              explanation:
                '"Information" is uncountable. Use "pieces of information" if you need to count.',
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "articles",
        title: "Articles: a / an / the",
        order: 2,
        readingText:
          "I bought a new graphics card yesterday.\nThe card supports ray tracing and has an efficient cooler.\nIt took an hour to install the drivers.\nThe performance in games is now twice as good.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "It took _____ hour to compile the project.",
            payload: {
              options: [
                { id: "a", text: "a" },
                { id: "b", text: "an" },
                { id: "c", text: "the" },
                { id: "d", text: "—" },
              ],
              correctAnswerId: "b",
              explanation: '"Hour" starts with a vowel sound /aʊ/ → "an".',
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "I have a laptop and a desktop. _____ laptop is faster.",
            payload: {
              options: [
                { id: "a", text: "A" },
                { id: "b", text: "An" },
                { id: "c", text: "The" },
                { id: "d", text: "—" },
              ],
              correctAnswerId: "c",
              explanation:
                'Second mention / specific thing known to both speakers → "the".',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She is _____ UX designer. (article)",
            payload: {
              text: "She is _____ UX designer.",
              correctAnswers: ["a"],
              explanation:
                '"UX" starts with a consonant sound /juː/ → "a", professions take an article.',
            },
            difficulty: 2,
          },
          {
            type: "TRUE_FALSE",
            prompt: 'We say "the Internet" with the definite article.',
            payload: {
              correctAnswer: true,
              explanation:
                'The Internet is a unique thing → "the Internet" (though lowercase "internet" is now common too).',
            },
            difficulty: 1,
          },
        ],
      },
    ],
  },
  {
    unit: 5,
    title: "Software",
    topics: [
      {
        slug: "past-simple",
        title: "Past Simple: Regular Verbs",
        order: 1,
        readingText:
          "Last month we released version 2.0 of our app.\nWe refactored the legacy code and improved load time by 40 percent.\nThe QA team tested every feature twice.\nUsers noticed the difference immediately and thanked us in reviews.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "We _____ the new feature last Friday.",
            payload: {
              options: [
                { id: "a", text: "deploy" },
                { id: "b", text: "deployed" },
                { id: "c", text: "deploys" },
                { id: "d", text: "deploying" },
              ],
              correctAnswerId: "b",
              explanation: '"Last Friday" → Past Simple: verb + -ed.',
            },
            difficulty: 1,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "_____ you _____ the changes before the demo?",
            payload: {
              options: [
                { id: "a", text: "Did / test" },
                { id: "b", text: "Did / tested" },
                { id: "c", text: "Do / tested" },
                { id: "d", text: "Were / test" },
              ],
              correctAnswerId: "a",
              explanation: "Past Simple questions: Did + subject + base verb.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt:
              "The team _____ (fix) more than fifty bugs during the sprint.",
            payload: {
              text: "The team _____ more than fifty bugs during the sprint.",
              correctAnswers: ["fixed"],
              explanation: "Regular verb in Past Simple: fix → fixed.",
            },
            difficulty: 1,
          },
          {
            type: "SPEAKING",
            prompt:
              "Tell about a project you finished recently. What did you do step by step? Use at least 4 sentences in Past Simple.",
            payload: {
              example:
                "Last semester I created a small web app. I designed the interface first. Then I coded the backend in Node.js. Finally, I tested everything and presented it to my class.",
              explanation:
                "Past Simple describes completed actions in the past.",
            },
            difficulty: 2,
          },
        ],
      },
      {
        slug: "past-simple-irregular",
        title: "Past Simple: Irregular Verbs",
        order: 2,
        readingText:
          "Yesterday the database went down at noon.\nWe found the cause quickly: a disk was full.\nThe admin wrote a cleanup script and ran it on all servers.\nBy evening everything came back to normal, and we sent a report to the manager.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt:
              "The senior developer _____ a brilliant solution yesterday.",
            payload: {
              options: [
                { id: "a", text: "finded" },
                { id: "b", text: "found" },
                { id: "c", text: "find" },
                { id: "d", text: "founds" },
              ],
              correctAnswerId: "b",
              explanation: "Irregular verb: find → found.",
            },
            difficulty: 1,
          },
          {
            type: "MATCHING",
            prompt: "Match the verb with its Past Simple form.",
            payload: {
              left: [
                { id: "1", text: "write" },
                { id: "2", text: "run" },
                { id: "3", text: "build" },
              ],
              right: [
                { id: "a", text: "ran" },
                { id: "b", text: "built" },
                { id: "c", text: "wrote" },
              ],
              pairs: [
                ["1", "c"],
                ["2", "a"],
                ["3", "b"],
              ],
              explanation:
                "Irregular verbs must be memorized: write–wrote, run–ran, build–built.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "She _____ (write) the migration script in twenty minutes.",
            payload: {
              text: "She _____ the migration script in twenty minutes.",
              correctAnswers: ["wrote"],
              explanation: "Irregular: write → wrote.",
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt: 'The Past Simple of "go" is "goed".',
            payload: {
              correctAnswer: false,
              explanation: "Go is irregular: go → went.",
            },
            difficulty: 1,
          },
        ],
      },
    ],
  },
  {
    unit: 6,
    title: "Networks",
    topics: [
      {
        slug: "past-continuous",
        title: "Past Continuous",
        order: 1,
        readingText:
          "At 2 am the monitoring system was sending alerts every minute.\nThe on-call engineer was sleeping when his phone rang.\nWhile he was investigating the issue, traffic was growing rapidly.\nThe whole team was working on the outage until sunrise.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "At 10 pm yesterday I _____ still _____ the network logs.",
            payload: {
              options: [
                { id: "a", text: "was / analyzing" },
                { id: "b", text: "were / analyzing" },
                { id: "c", text: "did / analyze" },
                { id: "d", text: "am / analyzing" },
              ],
              correctAnswerId: "a",
              explanation:
                "Action in progress at a specific past moment → Past Continuous (was/were + -ing).",
            },
            difficulty: 2,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "While we _____ the router, the connection dropped twice.",
            payload: {
              options: [
                { id: "a", text: "configured" },
                { id: "b", text: "were configuring" },
                { id: "c", text: "configure" },
                { id: "d", text: "are configuring" },
              ],
              correctAnswerId: "b",
              explanation:
                '"While" + longer background action → Past Continuous.',
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt: "They _____ (test) the firewall all morning.",
            payload: {
              text: "They _____ the firewall all morning.",
              correctAnswers: ["were testing"],
              explanation:
                "Duration in the past («all morning») → Past Continuous.",
            },
            difficulty: 1,
          },
          {
            type: "TRUE_FALSE",
            prompt: "Past Continuous is formed with «was/were + verb-ing».",
            payload: {
              correctAnswer: true,
              explanation:
                "Correct: I/he/she/it was + -ing; you/we/they were + -ing.",
            },
            difficulty: 1,
          },
        ],
      },
      {
        slug: "past-simple-vs-continuous",
        title: "Past Simple vs Past Continuous",
        order: 2,
        readingText:
          "I was updating the firmware when the power went out.\nLuckily, the UPS kicked in and saved the device.\nWhile the system was rebooting, we checked the backup configs.\nWhen everything came online, we finished the update successfully.",
        exercises: [
          {
            type: "MULTIPLE_CHOICE",
            prompt: "The server _____ when the admin _____ the room.",
            payload: {
              options: [
                { id: "a", text: "was overheating / entered" },
                { id: "b", text: "overheated / was entering" },
                { id: "c", text: "overheats / enters" },
                { id: "d", text: "was overheating / was entering" },
              ],
              correctAnswerId: "a",
              explanation:
                "Background action (Past Continuous) interrupted by a short action (Past Simple).",
            },
            difficulty: 3,
          },
          {
            type: "MULTIPLE_CHOICE",
            prompt: "When the alert fired, everyone _____ to the war room.",
            payload: {
              options: [
                { id: "a", text: "was running" },
                { id: "b", text: "ran" },
                { id: "c", text: "runs" },
                { id: "d", text: "were running" },
              ],
              correctAnswerId: "b",
              explanation:
                "A sequence of completed actions → Past Simple for both.",
            },
            difficulty: 2,
          },
          {
            type: "FILL_IN_BLANK",
            prompt:
              "While I _____ (monitor) traffic, I noticed a strange spike.",
            payload: {
              text: "While I _____ traffic, I noticed a strange spike.",
              correctAnswers: ["was monitoring"],
              explanation: '"While" + background action → Past Continuous.',
            },
            difficulty: 2,
          },
          {
            type: "REORDER",
            prompt: "Put the words in the correct order.",
            payload: {
              words: [
                "crashed",
                "I",
                "was",
                "when",
                "the app",
                "testing",
                "it",
              ],
              correctOrder: [
                "the app",
                "crashed",
                "when",
                "I",
                "was",
                "testing",
                "it",
              ],
              explanation:
                "Short action (Past Simple) + when + background (Past Continuous).",
            },
            difficulty: 3,
          },
        ],
      },
    ],
  },
];
