/** Discord message component types & builders. */

export const COMPONENT_TYPES = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
  TEXT_INPUT: 4,
  USER_SELECT: 5,
  ROLE_SELECT: 6,
  MENTIONABLE_SELECT: 7,
  CHANNEL_SELECT: 8,
};

export const BUTTON_STYLES = [
  { value: 1, label: "Primary", description: "Blurple" },
  { value: 2, label: "Secondary", description: "Grey" },
  { value: 3, label: "Success", description: "Green" },
  { value: 4, label: "Danger", description: "Red" },
  { value: 5, label: "Link", description: "URL button" },
  { value: 6, label: "Premium", description: "SKU purchase" },
];

export const TEXT_INPUT_STYLES = [
  { value: 1, label: "Short" },
  { value: 2, label: "Paragraph" },
];

export const CHANNEL_TYPES = [
  { value: 0, label: "Guild Text" },
  { value: 2, label: "Guild Voice" },
  { value: 4, label: "Guild Category" },
  { value: 5, label: "Guild Announcement" },
  { value: 10, label: "Announcement Thread" },
  { value: 11, label: "Public Thread" },
  { value: 12, label: "Private Thread" },
  { value: 13, label: "Guild Stage Voice" },
  { value: 15, label: "Guild Forum" },
  { value: 16, label: "Guild Media" },
];

export const SELECT_TYPES = [
  { value: 3, label: "String Select" },
  { value: 5, label: "User Select" },
  { value: 6, label: "Role Select" },
  { value: 7, label: "Mentionable Select" },
  { value: 8, label: "Channel Select" },
];

let uid = 0;
export const nextComponentId = () => `c_${++uid}_${Date.now()}`;

export function emptyButton() {
  return {
    id: nextComponentId(),
    kind: "button",
    style: 1,
    label: "Click me",
    customId: "button_1",
    url: "",
    skuId: "",
    disabled: false,
    emojiName: "",
    emojiId: "",
    emojiAnimated: false,
  };
}

export function emptySelectOption() {
  return {
    id: nextComponentId(),
    label: "Option",
    value: "option_1",
    description: "",
    default: false,
    emojiName: "",
    emojiId: "",
  };
}

export function emptySelect(type = 3) {
  return {
    id: nextComponentId(),
    kind: "select",
    type,
    customId: "select_1",
    placeholder: "Make a selection",
    minValues: 1,
    maxValues: 1,
    disabled: false,
    options: type === 3 ? [emptySelectOption()] : [],
    channelTypes: type === 8 ? [0] : [],
  };
}

export function emptyTextInput() {
  return {
    id: nextComponentId(),
    kind: "text_input",
    customId: "input_1",
    label: "Input",
    style: 1,
    placeholder: "",
    value: "",
    required: true,
    minLength: "",
    maxLength: "",
  };
}

export function emptyActionRow(childKind = "button") {
  return {
    id: nextComponentId(),
    kind: "row",
    children:
      childKind === "select"
        ? [emptySelect()]
        : childKind === "text_input"
          ? [emptyTextInput()]
          : [emptyButton()],
  };
}

function buildEmoji(name, id, animated) {
  if (!name && !id) return undefined;
  const emoji = {};
  if (name) emoji.name = name;
  if (id) emoji.id = id;
  if (animated) emoji.animated = true;
  return emoji;
}

function buildButton(btn) {
  const out = {
    type: COMPONENT_TYPES.BUTTON,
    style: btn.style,
    disabled: btn.disabled || undefined,
  };

  if (btn.style === 5) {
    out.url = btn.url || "https://discord.com";
    if (btn.label) out.label = btn.label;
  } else if (btn.style === 6) {
    out.sku_id = btn.skuId || "0";
  } else {
    out.custom_id = btn.customId || "button";
    if (btn.label) out.label = btn.label;
  }

  const emoji = buildEmoji(btn.emojiName, btn.emojiId, btn.emojiAnimated);
  if (emoji) out.emoji = emoji;

  return out;
}

function buildSelectOption(opt) {
  const out = {
    label: opt.label || "Option",
    value: opt.value || "option",
  };
  if (opt.description) out.description = opt.description;
  if (opt.default) out.default = true;
  const emoji = buildEmoji(opt.emojiName, opt.emojiId, false);
  if (emoji) out.emoji = emoji;
  return out;
}

function buildSelect(sel) {
  const out = {
    type: sel.type,
    custom_id: sel.customId || "select",
    disabled: sel.disabled || undefined,
  };
  if (sel.placeholder) out.placeholder = sel.placeholder;

  const min = Number(sel.minValues);
  const max = Number(sel.maxValues);
  if (Number.isFinite(min)) out.min_values = Math.max(0, Math.min(25, min));
  if (Number.isFinite(max)) out.max_values = Math.max(1, Math.min(25, max));

  if (sel.type === COMPONENT_TYPES.STRING_SELECT) {
    out.options = (sel.options || []).slice(0, 25).map(buildSelectOption);
  }
  if (sel.type === COMPONENT_TYPES.CHANNEL_SELECT && sel.channelTypes?.length) {
    out.channel_types = sel.channelTypes;
  }

  return out;
}

function buildTextInput(input) {
  const out = {
    type: COMPONENT_TYPES.TEXT_INPUT,
    custom_id: input.customId || "input",
    label: input.label || "Input",
    style: input.style || 1,
    required: input.required !== false,
  };
  if (input.placeholder) out.placeholder = input.placeholder;
  if (input.value) out.value = input.value;
  const min = Number(input.minLength);
  const max = Number(input.maxLength);
  if (Number.isFinite(min) && min > 0) out.min_length = min;
  if (Number.isFinite(max) && max > 0) out.max_length = max;
  return out;
}

function buildChild(child) {
  if (child.kind === "button") return buildButton(child);
  if (child.kind === "select") return buildSelect(child);
  if (child.kind === "text_input") return buildTextInput(child);
  return null;
}

export function buildComponentsPayload(rows) {
  return rows
    .map((row) => ({
      type: COMPONENT_TYPES.ACTION_ROW,
      components: (row.children || []).map(buildChild).filter(Boolean),
    }))
    .filter((row) => row.components.length > 0);
}

export function buildModalPayload({ customId, title, rows }) {
  return {
    custom_id: customId || "modal",
    title: title || "Modal",
    components: buildComponentsPayload(rows),
  };
}

export function createExampleComponents() {
  return [
    {
      id: nextComponentId(),
      kind: "row",
      children: [
        {
          ...emptyButton(),
          label: "Confirm",
          customId: "confirm",
          style: 3,
        },
        {
          ...emptyButton(),
          label: "Cancel",
          customId: "cancel",
          style: 4,
        },
        {
          ...emptyButton(),
          label: "Docs",
          style: 5,
          url: "https://discord.com/developers/docs",
        },
      ],
    },
    {
      id: nextComponentId(),
      kind: "row",
      children: [
        {
          ...emptySelect(3),
          customId: "plan",
          placeholder: "Pick a plan",
          options: [
            { ...emptySelectOption(), label: "Free", value: "free", description: "Basic access" },
            { ...emptySelectOption(), label: "Pro", value: "pro", description: "Extra features" },
          ],
        },
      ],
    },
  ];
}

export function createExampleModal() {
  return {
    customId: "feedback_modal",
    title: "Send Feedback",
    rows: [
      {
        id: nextComponentId(),
        kind: "row",
        children: [
          {
            ...emptyTextInput(),
            customId: "subject",
            label: "Subject",
            style: 1,
            placeholder: "Brief summary",
            required: true,
            maxLength: "100",
          },
        ],
      },
      {
        id: nextComponentId(),
        kind: "row",
        children: [
          {
            ...emptyTextInput(),
            customId: "body",
            label: "Details",
            style: 2,
            placeholder: "Tell us more…",
            required: true,
            maxLength: "1000",
          },
        ],
      },
    ],
  };
}
