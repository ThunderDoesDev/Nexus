/** Discord interaction callback types & builders. */

export const INTERACTION_TYPES = [
  {
    value: 4,
    id: "CHANNEL_MESSAGE_WITH_SOURCE",
    label: "Channel message",
    description: "Respond with a message (type 4)",
  },
  {
    value: 5,
    id: "DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE",
    label: "Defer reply",
    description: "Acknowledge and show “thinking…” (type 5)",
  },
  {
    value: 6,
    id: "DEFERRED_UPDATE_MESSAGE",
    label: "Defer update",
    description: "Acknowledge a component without editing yet (type 6)",
  },
  {
    value: 7,
    id: "UPDATE_MESSAGE",
    label: "Update message",
    description: "Edit the message the component is on (type 7)",
  },
  {
    value: 8,
    id: "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT",
    label: "Autocomplete",
    description: "Return autocomplete choices (type 8)",
  },
  {
    value: 9,
    id: "MODAL",
    label: "Modal",
    description: "Open a modal dialog (type 9)",
  },
  {
    value: 1,
    id: "PONG",
    label: "Pong",
    description: "ACK a PING (type 1)",
  },
];

export const MESSAGE_FLAG_OPTIONS = [
  { key: "EPHEMERAL", value: 1 << 6, label: "Ephemeral", description: "Only visible to the user" },
  { key: "SUPPRESS_EMBEDS", value: 1 << 2, label: "Suppress embeds", description: "Don't auto-embed links" },
  { key: "SUPPRESS_NOTIFICATIONS", value: 1 << 12, label: "Suppress notifications", description: "Silent message" },
  { key: "IS_COMPONENTS_V2", value: 1 << 15, label: "Components V2", description: "Use Components V2 layout" },
];

let uid = 0;
const nextId = () => `i_${++uid}_${Date.now()}`;

export function emptyChoice() {
  return { id: nextId(), name: "", value: "" };
}

export function emptyModalInput() {
  return {
    id: nextId(),
    customId: "field_1",
    label: "Field",
    style: 1,
    placeholder: "",
    required: true,
    minLength: "",
    maxLength: "",
  };
}

export function createDefaultState() {
  return {
    type: 4,
    content: "Hello from Nexus!",
    flags: ["EPHEMERAL"],
    tts: false,
    includeComponents: false,
    componentsJson: '[\n  {\n    "type": 1,\n    "components": [\n      {\n        "type": 2,\n        "style": 1,\n        "label": "Click",\n        "custom_id": "btn"\n      }\n    ]\n  }\n]',
    includeEmbeds: false,
    embedsJson: '[\n  {\n    "title": "Example",\n    "description": "Embed from an interaction response"\n  }\n]',
    choices: [
      { ...emptyChoice(), name: "Option A", value: "a" },
      { ...emptyChoice(), name: "Option B", value: "b" },
    ],
    modal: {
      customId: "example_modal",
      title: "Example Modal",
      inputs: [
        {
          ...emptyModalInput(),
          customId: "feedback",
          label: "Feedback",
          style: 2,
          placeholder: "Tell us more…",
          maxLength: "1000",
        },
      ],
    },
  };
}

function combineMessageFlags(flagKeys) {
  return (flagKeys || []).reduce((acc, key) => {
    const opt = MESSAGE_FLAG_OPTIONS.find((f) => f.key === key);
    return opt ? acc | opt.value : acc;
  }, 0);
}

function parseJsonArray(text, fallback = []) {
  if (!text?.trim()) return fallback;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return null;
  }
}

function buildModalComponents(inputs) {
  return (inputs || []).slice(0, 5).map((input) => {
    const component = {
      type: 4,
      custom_id: input.customId || "field",
      label: input.label || "Field",
      style: Number(input.style) === 2 ? 2 : 1,
      required: input.required !== false,
    };
    if (input.placeholder) component.placeholder = input.placeholder;
    const min = Number(input.minLength);
    const max = Number(input.maxLength);
    if (Number.isFinite(min) && min > 0) component.min_length = min;
    if (Number.isFinite(max) && max > 0) component.max_length = max;
    return {
      type: 1,
      components: [component],
    };
  });
}

export function buildInteractionResponse(state) {
  const type = Number(state.type) || 4;

  if (type === 1) {
    return { type: 1 };
  }

  if (type === 5 || type === 6) {
    const flags = combineMessageFlags(state.flags);
    const payload = { type };
    if (type === 5 && flags) {
      payload.data = { flags };
    }
    return payload;
  }

  if (type === 8) {
    const choices = (state.choices || [])
      .filter((c) => c.name?.trim())
      .slice(0, 25)
      .map((c) => {
        const name = c.name.trim().slice(0, 100);
        let value = c.value === "" || c.value == null ? name : c.value;
        if (typeof value === "string") value = value.slice(0, 100);
        return { name, value };
      });
    return {
      type: 8,
      data: { choices },
    };
  }

  if (type === 9) {
    return {
      type: 9,
      data: {
        custom_id: state.modal?.customId || "modal",
        title: (state.modal?.title || "Modal").slice(0, 45),
        components: buildModalComponents(state.modal?.inputs),
      },
    };
  }

  // Types 4 and 7 — message payloads
  const data = {};
  if (state.content?.trim()) data.content = state.content;
  if (state.tts) data.tts = true;

  const flags = combineMessageFlags(state.flags);
  if (flags) data.flags = flags;

  if (state.includeEmbeds) {
    const embeds = parseJsonArray(state.embedsJson, []);
    if (embeds === null) {
      return { error: "Embeds JSON is invalid." };
    }
    if (embeds.length) data.embeds = embeds.slice(0, 10);
  }

  if (state.includeComponents) {
    const components = parseJsonArray(state.componentsJson, []);
    if (components === null) {
      return { error: "Components JSON is invalid." };
    }
    if (components.length) data.components = components.slice(0, 5);
  }

  return { type, data };
}

export function responseNeedsData(type) {
  return ![1, 6].includes(Number(type));
}

export function responseSupportsMessage(type) {
  return [4, 7].includes(Number(type));
}

export function responseSupportsFlags(type) {
  return [4, 5, 7].includes(Number(type));
}
