/**
 * Approach 6 — comprehension checks for the reading/listening channels.
 *
 * Static content (no DB table → no migration). Questions are keyed by topic
 * slug and test understanding of the SAME passage the student reads/hears
 * (Topic.readingText). The audio is a TTS rendering of that text, so the same
 * question set works for both channels.
 *
 * Answer keys live here on the server only — the API never ships them to the
 * client, and grading happens server-side in ComprehensionService.
 */

export type CompQType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface ComprehensionQuestion {
  id: string;
  type: CompQType;
  prompt: string;
  /** Present for MULTIPLE_CHOICE only. */
  options?: { id: string; text: string }[];
  /** MC: correct option id (string). TF: correct boolean. */
  answer: string | boolean;
  explanation?: string;
}

const mc = (
  id: string,
  prompt: string,
  options: [string, string][],
  answer: string,
  explanation?: string,
): ComprehensionQuestion => ({
  id,
  type: 'MULTIPLE_CHOICE',
  prompt,
  options: options.map(([oid, text]) => ({ id: oid, text })),
  answer,
  explanation,
});

const tf = (
  id: string,
  prompt: string,
  answer: boolean,
  explanation?: string,
): ComprehensionQuestion => ({ id, type: 'TRUE_FALSE', prompt, answer, explanation });

/** slug → comprehension questions (used for both reading and listening). */
export const COMPREHENSION: Record<string, ComprehensionQuestion[]> = {
  'present-simple': [
    mc(
      'ps-1',
      'What does the developer design?',
      [
        ['a', 'Websites only'],
        ['b', 'Applications for mobile devices'],
        ['c', 'Computer hardware'],
        ['d', 'Office furniture'],
      ],
      'b',
      'The text says she designs applications for mobile devices.',
    ),
    tf(
      'ps-2',
      'The developer works alone and never talks to her team.',
      false,
      'She communicates with her team about project requirements.',
    ),
    mc(
      'ps-3',
      'Which activities does she do every day?',
      [
        ['a', 'Codes, tests, and debugs'],
        ['b', 'Designs hardware'],
        ['c', 'Manages the budget'],
        ['d', 'Writes legal contracts'],
      ],
      'a',
    ),
  ],
  'nouns-plural': [
    tf('np-1', 'Software developers use keyboards and mice.', true),
    mc(
      'np-2',
      'What do the teams include?',
      [
        ['a', 'Only managers'],
        ['b', 'Specialists in different areas'],
        ['c', 'Just one person'],
        ['d', 'No developers at all'],
      ],
      'b',
    ),
    tf(
      'np-3',
      'There is only one computer in the IT department.',
      false,
      'The text mentions many computers and servers.',
    ),
  ],
  'personality-adjectives': [
    mc(
      'pa-1',
      'According to the text, communication skills are…',
      [
        ['a', 'Unimportant'],
        ['b', 'Important for team members'],
        ['c', 'Only for managers'],
        ['d', 'Completely optional'],
      ],
      'b',
    ),
    tf(
      'pa-2',
      'Good developers should be disorganized.',
      false,
      'They must be organized, patient, and hardworking.',
    ),
    mc(
      'pa-3',
      'Successful teams have professionals who are…',
      [
        ['a', 'Dedicated and motivated'],
        ['b', 'Lazy and careless'],
        ['c', 'Unreliable'],
        ['d', 'Inexperienced'],
      ],
      'a',
    ),
  ],
  comparatives: [
    mc(
      'cmp-1',
      'Which search is faster?',
      [
        ['a', 'A full table scan'],
        ['b', 'An indexed search'],
        ['c', 'Both are equal'],
        ['d', 'Neither works'],
      ],
      'b',
    ),
    tf(
      'cmp-2',
      'NoSQL databases are often simpler to scale horizontally.',
      true,
    ),
    mc(
      'cmp-3',
      'Relational databases are usually better for…',
      [
        ['a', 'Transactional data'],
        ['b', 'Storing images'],
        ['c', 'Scaling horizontally'],
        ['d', 'Nothing in particular'],
      ],
      'a',
    ),
  ],
  'present-perfect': [
    mc(
      'pp-1',
      'How long has the team worked on the redesign?',
      [
        ['a', 'Three days'],
        ['b', 'Three weeks'],
        ['c', 'Three months'],
        ['d', 'Three years'],
      ],
      'c',
    ),
    tf('pp-2', 'The designers have already started the next iteration.', true),
    mc(
      'pp-3',
      'What have they just deployed?',
      [
        ['a', 'A new database'],
        ['b', 'The new landing page'],
        ['c', 'A mobile app'],
        ['d', 'A new server'],
      ],
      'b',
    ),
  ],
  'present-perfect-vs-past': [
    mc(
      'ppp-1',
      'How many versions did they release last year?',
      [
        ['a', 'One'],
        ['b', 'Three'],
        ['c', 'None'],
        ['d', 'Ten'],
      ],
      'a',
      'Last year they released only one version; three were released this year.',
    ),
    tf('ppp-2', 'They have released three versions this year.', true),
    mc(
      'ppp-3',
      'When did the speaker fix the bug?',
      [
        ['a', 'This morning'],
        ['b', 'Yesterday evening after the standup'],
        ['c', 'Last week'],
        ['d', 'Last year'],
      ],
      'b',
    ),
  ],
  'will-going-to': [
    mc(
      'wgt-1',
      'What will they rewrite the app in?',
      [
        ['a', 'React Native'],
        ['b', 'Flutter'],
        ['c', 'Swift'],
        ['d', 'Kotlin'],
      ],
      'b',
    ),
    tf('wgt-2', 'They will start with the login module.', true),
    mc(
      'wgt-3',
      'What does the speaker think users will love?',
      [
        ['a', 'The crash rate'],
        ['b', 'The new offline mode'],
        ['c', 'The old design'],
        ['d', 'The login screen'],
      ],
      'b',
    ),
  ],
  'modals-obligation': [
    mc(
      'mo-1',
      'How often do you have to change your password?',
      [
        ['a', 'Every 30 days'],
        ['b', 'Every 90 days'],
        ['c', 'Every year'],
        ['d', 'Never'],
      ],
      'b',
    ),
    tf("mo-2", "You mustn't share your credentials with anyone.", true),
    mc(
      'mo-3',
      'What is true about contractors and the security training?',
      [
        ['a', 'They must attend it'],
        ['b', "They don't have to attend, but it is recommended"],
        ['c', 'They are banned from it'],
        ['d', 'They must skip it'],
      ],
      'b',
    ),
  ],
  'first-conditional': [
    mc(
      'fc-1',
      'What happens if the traffic grows?',
      [
        ['a', 'The site goes down'],
        ['b', 'The autoscaler adds more instances'],
        ['c', 'Nothing changes'],
        ['d', 'You get a refund'],
      ],
      'b',
    ),
    tf(
      'fc-2',
      'If CPU usage stays above ninety percent, the system will send an alert.',
      true,
    ),
    mc(
      'fc-3',
      'If they move to the cloud, they…',
      [
        ['a', 'Will need a bigger server room'],
        ['b', "Won't need their own server room"],
        ['c', 'Will buy more servers'],
        ['d', 'Will hire more staff'],
      ],
      'b',
    ),
  ],
  'relative-clauses': [
    mc(
      'rc-1',
      'How long does a sprint usually last?',
      [
        ['a', 'One week'],
        ['b', 'Two weeks'],
        ['c', 'One month'],
        ['d', 'Two months'],
      ],
      'b',
    ),
    tf("rc-2", "A project manager coordinates the team's work.", true),
    mc(
      'rc-3',
      'Which tasks have the highest priority?',
      [
        ['a', 'The easiest ones'],
        ['b', 'The tasks that block the release'],
        ['c', 'All tasks equally'],
        ['d', 'The newest ones'],
      ],
      'b',
    ),
  ],
  'reported-speech': [
    mc(
      'rs-1',
      'What did Anna say she had finished?',
      [
        ['a', 'The design'],
        ['b', 'The integration tests'],
        ['c', 'The deployment'],
        ['d', 'The documentation'],
      ],
      'b',
    ),
    tf('rs-2', 'The CTO announced a move to a four-day week.', true),
    mc(
      'rs-3',
      'How many more changes did the client want?',
      [
        ['a', 'One'],
        ['b', 'Two'],
        ['c', 'Three'],
        ['d', 'None'],
      ],
      'b',
    ),
  ],
  'third-conditional': [
    tf(
      'tc-1',
      'The outage would not have happened if someone had checked the config.',
      true,
    ),
    mc(
      'tc-2',
      'What would have caught the bug earlier?',
      [
        ['a', 'More meetings'],
        ['b', 'Writing more tests'],
        ['c', 'A bigger team'],
        ['d', 'More servers'],
      ],
      'b',
    ),
    mc(
      'tc-3',
      'What would have saved hours?',
      [
        ['a', 'Automating the regression suite'],
        ['b', 'Skipping the tests'],
        ['c', 'Adding more outages'],
        ['d', 'Working longer Fridays'],
      ],
      'a',
    ),
  ],
  'past-perfect': [
    mc(
      'ppf-1',
      'How many times had the pipeline failed before the team arrived?',
      [
        ['a', 'Once'],
        ['b', 'Twice'],
        ['c', 'Three times'],
        ['d', 'It never failed'],
      ],
      'c',
    ),
    tf(
      'ppf-2',
      'Deployments became easier after they containerized the services.',
      true,
    ),
    mc(
      'ppf-3',
      'When did they adopt Docker?',
      [
        ['a', '2018'],
        ['b', '2020'],
        ['c', '2022'],
        ['d', 'They never did'],
      ],
      'b',
    ),
  ],
};
