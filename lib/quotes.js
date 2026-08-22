// A big pool of short motivation lines, built from templates so it's
// genuinely varied instead of ~20 lines repeating on a loop. Each template
// pairs two word/phrase banks that are grammatically interchangeable, so
// every combination reads as a real sentence — no random-word-salad risk.
// getRandomQuote() picks a fresh one on every call (see MotivationStrip,
// which calls it once per page load).

function cross(template, bankA, bankB) {
  const out = [];
  for (const a of bankA) {
    for (const b of bankB) {
      out.push(template(a, b));
    }
  }
  return out;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const NEED_NOT = [
  "more motivation",
  "a better setup",
  "the perfect plan",
  "more time",
  "someone's permission",
  "ideal conditions",
  "a clean slate",
  "less pressure",
  "a new notebook",
  "more willpower",
  "a better mood",
  "the right playlist",
];
const NEED = [
  "ten more minutes",
  "one honest hour",
  "today's rep",
  "the next small step",
  "to start anyway",
  "consistency, not intensity",
  "to show up tired",
  "to begin badly",
  "fifteen focused minutes",
  "one finished task",
  "to sit down first",
  "to stop waiting",
];

const TODAY = [
  "Discipline",
  "Small effort",
  "One focused hour",
  "Quiet consistency",
  "This unglamorous rep",
  "A single rep",
  "Ten honest minutes",
  "Showing up",
  "One more page",
  "One more problem set",
];
const TOMORROW = [
  "momentum",
  "a different trajectory",
  "the version of you that gets in",
  "less regret",
  "proof you can do it again",
  "a lighter load",
  "a head start",
  "less to catch up on",
  "a stronger habit",
  "a calmer you",
];

const WINS = [
  "Consistency",
  "Discipline",
  "Small daily effort",
  "Quiet persistence",
  "Showing up",
  "Doing the work",
  "One finished task",
  "Steady progress",
  "A single honest rep",
  "Starting badly",
];
const LOSES = [
  "perfect intentions",
  "waiting for motivation",
  "a burst of inspiration",
  "talent alone",
  "one heroic effort",
  "a good excuse",
  "the mood to work",
  "ideal conditions",
  "a flawless plan",
  "doing nothing",
];

const DECISION_SUBJECT = ["Discipline", "Focus", "Showing up", "Consistency", "Progress", "Confidence", "Momentum"];
const NOT_A_FEELING = [
  "a feeling",
  "a mood",
  "something you wait for",
  "a personality trait",
  "luck",
  "a talent",
  "a stroke of inspiration",
];

const SCHOOL_SUBJECT = [
  "Consistency",
  "Discipline",
  "Small daily reps",
  "Showing up on hard days",
  "Doing the boring work",
  "Finishing what you start",
];
const SCHOOL_NOT = ["talent", "motivation", "a lucky day", "a perfect plan", "one good week", "raw intelligence"];

const FUTURE_YOU_IS = [
  "watching",
  "counting on you",
  "already grateful",
  "waiting",
  "depending on today",
  "keeping score",
];
const FUTURE_YOU_GIVE = [
  "something to work with",
  "a head start",
  "proof you followed through",
  "fewer excuses to clean up",
  "momentum, not regret",
  "a reason to trust you",
];

const OUNCES = ["Discipline", "Effort", "Starting", "Showing up", "A hard rep", "Doing it anyway"];
const TONS = ["Regret", "Falling behind", "Excuses", "Avoidance", "Wasted time", "What-ifs"];

const ONE_AWAY = ["focused session", "honest hour", "finished task", "small win", "good decision", "hard rep"];
const AWAY_FROM = [
  "momentum",
  "a better week",
  "proof you can do this",
  "a real head start",
  "a different outcome",
  "getting unstuck",
];

const SKILL_IS = ["Skill", "Confidence", "Discipline", "Calm under pressure", "Focus"];
const SURVIVED = ["discomfort", "difficulty", "doubt", "pressure", "boredom"];

const NOBODY_REMEMBERS = [
  "the days that felt hard",
  "the boring reps",
  "the slow progress",
  "the unglamorous work",
  "the quiet consistency",
];
const THEY_REMEMBER = [
  "what those days built",
  "who you became",
  "the results",
  "the comeback",
  "the person who kept going",
];

const NOT_ABOUT = ["having time", "being motivated", "feeling ready", "having the perfect plan", "talent"];
const ITS_ABOUT = [
  "making the next hour count",
  "starting anyway",
  "showing up tired",
  "doing the next small thing",
  "consistency",
];

const GENERATED = [
  ...cross((a, b) => `You don't need ${a}, you need ${b}.`, NEED_NOT, NEED),
  ...cross((a, b) => `${a} today. ${cap(b)} tomorrow.`, TODAY, TOMORROW),
  ...cross((a, b) => `${a} beats ${b}.`, WINS, LOSES),
  ...cross((a, b) => `${a} is a decision, not ${b}.`, DECISION_SUBJECT, NOT_A_FEELING),
  ...cross((a, b) => `${a}, not ${b}, gets you where you're going.`, SCHOOL_SUBJECT, SCHOOL_NOT),
  ...cross((a, b) => `Future you is ${a}. Give them ${b}.`, FUTURE_YOU_IS, FUTURE_YOU_GIVE),
  ...cross((a, b) => `${a} weighs ounces. ${b} weighs tons.`, OUNCES, TONS),
  ...cross((a, b) => `You are one ${a} away from ${b}.`, ONE_AWAY, AWAY_FROM),
  ...cross((a, b) => `${a} is just ${b} you've survived enough times.`, SKILL_IS, SURVIVED),
  ...cross((a, b) => `Nobody remembers ${a}. They remember ${b}.`, NOBODY_REMEMBERS, THEY_REMEMBER),
  ...cross((a, b) => `It's not about ${a}. It's about ${b}.`, NOT_ABOUT, ITS_ABOUT),
];

// Hand-written standalone lines — no template fits these naturally.
const STANDALONE = [
  "The goal isn't the score. It's who you become chasing it.",
  "Discipline is choosing between what you want now and what you want most.",
  "You don't rise to the level of your goals, you fall to the level of your systems.",
  "Nobody's coming to save you from your own procrastination — start anyway.",
  "The work you avoid today is still there tomorrow, plus interest.",
  "Progress is invisible day to day and obvious year to year.",
  "Comfort and growth don't share the same room.",
  "Long-term thinking is a competitive advantage almost nobody uses.",
  "You're not behind. You're exactly on the timeline your effort has built.",
  "Good enough, done, beats perfect, someday.",
  "Success is a few simple disciplines, practiced every day.",
  "What you do in the next hour compounds more than you think.",
  "The best time to focus was earlier. The next best time is right now.",
  "Every session you finish is proof you can finish the next one.",
  "The SAT ends in a few hours. The habits you're building don't.",
  "The version of you that gets into a great school starts as the version who sits down anyway.",
  "It's not about having time. It's about making the next 45 minutes count.",
  "Results don't ask if you felt ready today.",
  "Motivation gets you started. Habit keeps you going.",
  "Nothing about today has to be impressive. It just has to happen.",
  "You already know the next step. The only question is whether you take it now.",
  "Momentum is built in minutes, not moods.",
  "A slow yes beats a fast no.",
  "The hard part isn't the work. It's starting the work.",
  "Doing beats thinking about doing, every time.",
  "Today doesn't need to be your best. It just needs to be a rep.",
  "Nobody sees the rough drafts. Everybody sees the result.",
  "You can't out-plan a lack of starting.",
  "Effort compounds quietly, then all at once.",
  "The person you're becoming is built in ordinary hours like this one.",
];

const ALL_QUOTES = [...GENERATED, ...STANDALONE];

export function getRandomQuote() {
  return ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
}

export function quotePoolSize() {
  return ALL_QUOTES.length;
}
