export const STATUS_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "funny", label: "Funny" },
  { id: "chill", label: "Chill" },
  { id: "gaming", label: "Gaming" },
  { id: "study", label: "Study" },
  { id: "afk", label: "AFK" },
  { id: "creative", label: "Creative" },
];

export const STATUS_IDEAS = [
  { text: "buffering… please stand by", category: "funny" },
  { text: "currently out of spoons", category: "chill" },
  { text: "afk arguing with my toaster", category: "funny" },
  { text: "one more match (lying)", category: "gaming" },
  { text: "studying like my GPA depends on it", category: "study" },
  { text: "brb becoming a myth", category: "afk" },
  { text: "crafting lore in real time", category: "creative" },
  { text: "do not disturb (unless snacks)", category: "chill" },
  { text: "ranked anxiety loading", category: "gaming" },
  { text: "alive, barely buffered", category: "funny" },
  { text: "soft launch of my personality", category: "creative" },
  { text: "in a meeting with my brain", category: "study" },
  { text: "gone fishing for dopamine", category: "afk" },
  { text: "npc energy today", category: "funny" },
  { text: "grinding quietly", category: "gaming" },
  { text: "vibing in 0.75x speed", category: "chill" },
  { text: "thesis vs sleep — sleep winning", category: "study" },
  { text: "offline but spiritually online", category: "afk" },
  { text: "painting pixels with feelings", category: "creative" },
  { text: "please submit all bugs in triplicate", category: "funny" },
  { text: "touching grass (scheduled)", category: "chill" },
  { text: "clutch or kick — emotional damage", category: "gaming" },
  { text: "highlighting everything, remembering nothing", category: "study" },
  { text: "be right back in 3–5 business days", category: "afk" },
  { text: "worldbuilding my grocery list", category: "creative" },
  { text: "error 404: motivation not found", category: "funny" },
  { text: "low power mode", category: "chill" },
  { text: "warming up ranked tears", category: "gaming" },
  { text: "pomodoro, but make it chaotic", category: "study" },
  { text: "mentally in another tab", category: "afk" },
  { text: "main character side quest", category: "creative" },
  { text: "certified yap-free zone", category: "chill" },
  { text: "gg go next (emotionally)", category: "gaming" },
  { text: "notes open, brain closed", category: "study" },
  { text: "summon me with snacks", category: "funny" },
  { text: "quietly plotting kindness", category: "creative" },
];

export function pickRandomStatuses(count = 6, category = "all") {
  const pool =
    category === "all" ? STATUS_IDEAS : STATUS_IDEAS.filter((s) => s.category === category);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
