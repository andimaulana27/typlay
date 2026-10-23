export type Level = "home" | "common" | "pro";

// Only a s d f g h j k l — the first thing every touch typist learns.
const HOME = [
  "a", "as", "ad", "add", "all", "ask", "asks", "dad", "dads", "fad", "fall", "falls", "flag", "flags",
  "flask", "flash", "gas", "glad", "glass", "hall", "halls", "has", "half", "lad", "lads", "lag", "lash",
  "sad", "salad", "shall", "dash", "hash", "alas", "gala", "jag", "lass", "sash", "gall", "slash", "flak",
  "gash", "hag", "jags", "skald", "dahl", "shad", "gaff", "lag", "salsa", "alfalfa",
];

const COMMON = [
  "the", "be", "of", "and", "to", "in", "he", "have", "it", "that", "for", "they", "with", "as", "not",
  "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all",
  "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so",
  "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some",
  "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now",
  "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many",
  "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well",
  "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high",
  "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write",
  "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under",
  "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while",
  "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few",
  "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open",
  "public", "follow", "during", "present", "without", "again", "hold", "around", "possible", "head",
  "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan",
  "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change",
  "help", "line", "light", "music", "game", "fast", "type", "key", "learn", "score", "fun", "win",
];

const PRO = [
  "keyboard", "rhythm", "velocity", "challenge", "practice", "momentum", "precision", "adventure",
  "galaxy", "quantum", "journey", "phoenix", "symphony", "whisper", "horizon", "frequency", "algorithm",
  "marathon", "champion", "discovery", "lightning", "mechanism", "satellite", "wonderful", "brilliant",
  "knowledge", "atmosphere", "adjective", "boulevard", "carnival", "dangerous", "efficient",
  "fantastic", "geography", "hurricane", "invisible", "jellyfish", "kangaroo", "labyrinth", "magnetic",
  "nostalgia", "orchestra", "paradox", "quizzical", "rectangle", "spectrum", "telescope", "universe",
  "volcano", "wavelength", "xylophone", "yesterday", "zeppelin", "dynamic", "explorer", "gravity",
  "harmony", "illusion", "juggler", "kingdom", "luminous", "mystery", "nebula", "odyssey", "pyramid",
  "question", "radiant", "stardust", "thunder", "upgrade", "vertical", "wizard", "zenith",
];

const PUNCTUATION = [",", ".", "?", "!", ";"];

function pick<T>(list: readonly T[]) {
  return list[Math.floor(Math.random() * list.length)] as T;
}

const POOLS: Record<Level, readonly string[]> = { home: HOME, common: COMMON, pro: [...PRO, ...COMMON] };

export function buildText(level: Level, count: number) {
  const pool = POOLS[level];
  const out: string[] = [];
  for (let index = 0; index < count; index += 1) {
    let word = pick(pool);
    while (word === out[out.length - 1]) word = pick(pool);
    if (level === "pro" && Math.random() < 0.14) word += pick(PUNCTUATION);
    out.push(word);
  }
  return out.join(" ");
}

const METEOR_POOL = [...new Set([...COMMON, ...PRO])].filter((word) => /^[a-z]+$/.test(word));

// Word length grows with the wave; first letters stay unique on screen so every key has one target.
export function meteorWord(wave: number, taken: Set<string>, boss = false) {
  const min = boss ? 9 : Math.min(2 + Math.floor(wave / 2), 6);
  const max = boss ? 14 : Math.min(4 + wave, 10);
  const sized = METEOR_POOL.filter((word) => word.length >= min && word.length <= max);
  const free = sized.filter((word) => !taken.has(word[0]));
  return pick(free.length ? free : sized.length ? sized : METEOR_POOL);
}
