let uid = 0;
const nextId = () => `p_${++uid}_${Date.now()}`;

export function emptyAnswer(text = "") {
  return {
    id: nextId(),
    text,
    emojiName: "",
    emojiId: "",
  };
}

export function createExamplePoll() {
  return {
    question: "Which feature should we ship next?",
    answers: [
      emptyAnswer("Components builder"),
      emptyAnswer("Invite lookup"),
      emptyAnswer("Permission overwrites"),
    ],
    duration: 24,
    allowMultiselect: false,
  };
}

export function buildPollPayload({ question, answers, duration, allowMultiselect }) {
  const mediaAnswers = (answers || [])
    .filter((a) => a.text?.trim())
    .slice(0, 10)
    .map((a) => {
      const poll_media = { text: a.text.trim() };
      if (a.emojiId || a.emojiName) {
        poll_media.emoji = {};
        if (a.emojiName) poll_media.emoji.name = a.emojiName;
        if (a.emojiId) poll_media.emoji.id = a.emojiId;
      }
      return { poll_media };
    });

  return {
    question: { text: (question || "").trim() || "Question" },
    answers: mediaAnswers.length
      ? mediaAnswers
      : [{ poll_media: { text: "Option 1" } }, { poll_media: { text: "Option 2" } }],
    duration: Math.min(768, Math.max(1, Number(duration) || 24)),
    allow_multiselect: Boolean(allowMultiselect),
    layout_type: 1,
  };
}

export function buildPollMessageJson(poll) {
  return {
    content: null,
    poll: buildPollPayload(poll),
  };
}
