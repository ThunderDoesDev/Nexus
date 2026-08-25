/** Discord hard limits for messages, embeds, components, and commands. */

export const LIMITS = {
  message: {
    content: 2000,
    embeds: 10,
    embedTotalChars: 6000,
    stickers: 3,
    actionRows: 5,
    files: 10,
  },
  embed: {
    title: 256,
    description: 4096,
    fields: 25,
    fieldName: 256,
    fieldValue: 1024,
    footer: 2048,
    author: 256,
  },
  component: {
    buttonLabel: 80,
    customId: 100,
    selectPlaceholder: 150,
    selectOptions: 25,
    selectOptionLabel: 100,
    selectOptionValue: 100,
    selectOptionDescription: 100,
    buttonsPerRow: 5,
    textInputLabel: 45,
    textInputPlaceholder: 100,
    textInputValue: 4000,
    modalTitle: 45,
    modalInputs: 5,
  },
  command: {
    name: 32,
    description: 100,
    options: 25,
    choices: 25,
    choiceName: 100,
    choiceValue: 100,
  },
  webhook: {
    username: 80,
    content: 2000,
  },
  poll: {
    question: 300,
    answers: 10,
    answerText: 55,
    durationMax: 768,
  },
};

function len(value) {
  if (value == null) return 0;
  return String(value).length;
}

function check(path, current, max, extra = {}) {
  const over = current > max;
  return {
    path,
    current,
    max,
    remaining: Math.max(0, max - current),
    pct: max === 0 ? 0 : Math.min(100, Math.round((current / max) * 100)),
    ok: !over,
    over,
    ...extra,
  };
}

function embedCharCount(embed) {
  if (!embed || typeof embed !== "object") return 0;
  let total = 0;
  total += len(embed.title);
  total += len(embed.description);
  total += len(embed.footer?.text);
  total += len(embed.author?.name);
  if (Array.isArray(embed.fields)) {
    for (const field of embed.fields) {
      total += len(field?.name);
      total += len(field?.value);
    }
  }
  return total;
}

export function analyzeEmbed(embed, index = 0) {
  const prefix = `embeds[${index}]`;
  const checks = [
    check(`${prefix}.title`, len(embed?.title), LIMITS.embed.title),
    check(`${prefix}.description`, len(embed?.description), LIMITS.embed.description),
    check(`${prefix}.fields`, Array.isArray(embed?.fields) ? embed.fields.length : 0, LIMITS.embed.fields),
    check(`${prefix}.footer.text`, len(embed?.footer?.text), LIMITS.embed.footer),
    check(`${prefix}.author.name`, len(embed?.author?.name), LIMITS.embed.author),
    check(`${prefix} total chars`, embedCharCount(embed), LIMITS.message.embedTotalChars, {
      note: "Counts toward the 6000-char embed budget (shared across all embeds)",
    }),
  ];

  if (Array.isArray(embed?.fields)) {
    embed.fields.forEach((field, i) => {
      checks.push(
        check(`${prefix}.fields[${i}].name`, len(field?.name), LIMITS.embed.fieldName),
        check(`${prefix}.fields[${i}].value`, len(field?.value), LIMITS.embed.fieldValue)
      );
    });
  }

  return checks;
}

export function analyzeMessage(message) {
  const msg = message && typeof message === "object" ? message : {};
  const embeds = Array.isArray(msg.embeds) ? msg.embeds : [];
  const components = Array.isArray(msg.components) ? msg.components : [];
  const checks = [
    check("content", len(msg.content), LIMITS.message.content),
    check("embeds", embeds.length, LIMITS.message.embeds),
    check(
      "embed total chars",
      embeds.reduce((sum, e) => sum + embedCharCount(e), 0),
      LIMITS.message.embedTotalChars
    ),
    check("components (action rows)", components.length, LIMITS.message.actionRows),
  ];

  embeds.forEach((embed, i) => {
    checks.push(...analyzeEmbed(embed, i));
  });

  components.forEach((row, ri) => {
    const children = Array.isArray(row?.components) ? row.components : [];
    const buttons = children.filter((c) => c?.type === 2);
    if (buttons.length) {
      checks.push(
        check(`components[${ri}] buttons`, buttons.length, LIMITS.component.buttonsPerRow)
      );
    }
    children.forEach((child, ci) => {
      const p = `components[${ri}].components[${ci}]`;
      if (child?.type === 2) {
        checks.push(check(`${p}.label`, len(child.label), LIMITS.component.buttonLabel));
        if (child.style !== 5 && child.style !== 6) {
          checks.push(check(`${p}.custom_id`, len(child.custom_id), LIMITS.component.customId));
        }
      }
      if (child?.type === 3) {
        checks.push(
          check(`${p}.custom_id`, len(child.custom_id), LIMITS.component.customId),
          check(`${p}.placeholder`, len(child.placeholder), LIMITS.component.selectPlaceholder),
          check(
            `${p}.options`,
            Array.isArray(child.options) ? child.options.length : 0,
            LIMITS.component.selectOptions
          )
        );
        (child.options || []).forEach((opt, oi) => {
          checks.push(
            check(`${p}.options[${oi}].label`, len(opt?.label), LIMITS.component.selectOptionLabel),
            check(`${p}.options[${oi}].value`, len(opt?.value), LIMITS.component.selectOptionValue),
            check(
              `${p}.options[${oi}].description`,
              len(opt?.description),
              LIMITS.component.selectOptionDescription
            )
          );
        });
      }
    });
  });

  if (msg.poll) {
    checks.push(
      check("poll.question", len(msg.poll.question?.text), LIMITS.poll.question),
      check(
        "poll.answers",
        Array.isArray(msg.poll.answers) ? msg.poll.answers.length : 0,
        LIMITS.poll.answers
      )
    );
    (msg.poll.answers || []).forEach((a, i) => {
      checks.push(
        check(`poll.answers[${i}]`, len(a?.poll_media?.text), LIMITS.poll.answerText)
      );
    });
  }

  return summarize(checks);
}

export function analyzeCommand(command) {
  const cmd = command && typeof command === "object" ? command : {};
  const options = Array.isArray(cmd.options) ? cmd.options : [];
  const checks = [
    check("name", len(cmd.name), LIMITS.command.name),
    check("description", len(cmd.description), LIMITS.command.description),
    check("options", options.length, LIMITS.command.options),
  ];

  const walk = (opts, prefix) => {
    (opts || []).forEach((opt, i) => {
      const p = `${prefix}[${i}]`;
      checks.push(
        check(`${p}.name`, len(opt?.name), LIMITS.command.name),
        check(`${p}.description`, len(opt?.description), LIMITS.command.description)
      );
      if (Array.isArray(opt?.choices)) {
        checks.push(check(`${p}.choices`, opt.choices.length, LIMITS.command.choices));
        opt.choices.forEach((c, ci) => {
          checks.push(
            check(`${p}.choices[${ci}].name`, len(c?.name), LIMITS.command.choiceName),
            check(`${p}.choices[${ci}].value`, len(String(c?.value ?? "")), LIMITS.command.choiceValue)
          );
        });
      }
      if (Array.isArray(opt?.options)) walk(opt.options, `${p}.options`);
    });
  };
  walk(options, "options");

  return summarize(checks);
}

function summarize(checks) {
  const overs = checks.filter((c) => c.over);
  const warnings = checks.filter((c) => !c.over && c.pct >= 90);
  return {
    checks,
    overs,
    warnings,
    ok: overs.length === 0,
    overCount: overs.length,
    warnCount: warnings.length,
  };
}

export function analyzePayload(raw) {
  let parsed;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { error: "Invalid JSON — fix syntax and try again." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { error: "JSON must be an object or array of embeds." };
  }

  // Interaction response wrapper
  if (typeof parsed.type === "number" && parsed.data) {
    const data = parsed.data;
    if (parsed.type === 8) {
      const choices = Array.isArray(data.choices) ? data.choices : [];
      return {
        kind: "autocomplete",
        ...summarize([
          check("choices", choices.length, LIMITS.command.choices),
          ...choices.flatMap((c, i) => [
            check(`choices[${i}].name`, len(c?.name), LIMITS.command.choiceName),
            check(`choices[${i}].value`, len(String(c?.value ?? "")), LIMITS.command.choiceValue),
          ]),
        ]),
      };
    }
    if (parsed.type === 9) {
      const inputs = Array.isArray(data.components) ? data.components : [];
      return {
        kind: "modal",
        ...summarize([
          check("title", len(data.title), LIMITS.component.modalTitle),
          check("custom_id", len(data.custom_id), LIMITS.component.customId),
          check("inputs", inputs.length, LIMITS.component.modalInputs),
          ...inputs.flatMap((row, i) => {
            const input = row?.components?.[0];
            if (!input) return [];
            return [
              check(`inputs[${i}].label`, len(input.label), LIMITS.component.textInputLabel),
              check(`inputs[${i}].custom_id`, len(input.custom_id), LIMITS.component.customId),
              check(
                `inputs[${i}].placeholder`,
                len(input.placeholder),
                LIMITS.component.textInputPlaceholder
              ),
            ];
          }),
        ]),
      };
    }
    return { kind: "interaction", ...analyzeMessage(data) };
  }

  // Slash command
  if (typeof parsed.type === "number" && parsed.name && (parsed.description != null || parsed.type !== 1)) {
    if ([1, 2, 3].includes(parsed.type) || parsed.description != null) {
      return { kind: "command", ...analyzeCommand(parsed) };
    }
  }
  if (parsed.name && parsed.description != null && !parsed.content && !parsed.embeds) {
    return { kind: "command", ...analyzeCommand(parsed) };
  }

  // Bare embeds array
  if (Array.isArray(parsed)) {
    return {
      kind: "embeds",
      ...analyzeMessage({ embeds: parsed }),
    };
  }

  // Single embed object
  if (
    parsed.title != null ||
    parsed.description != null ||
    parsed.fields != null ||
    parsed.footer != null ||
    parsed.author != null
  ) {
    if (!parsed.content && !parsed.components && !parsed.embeds) {
      return { kind: "embed", ...analyzeMessage({ embeds: [parsed] }) };
    }
  }

  return { kind: "message", ...analyzeMessage(parsed) };
}

export const LIMIT_REFERENCE = [
  { group: "Message", items: [
    { label: "Content", max: LIMITS.message.content },
    { label: "Embeds", max: LIMITS.message.embeds },
    { label: "Embed total characters", max: LIMITS.message.embedTotalChars },
    { label: "Action rows", max: LIMITS.message.actionRows },
  ]},
  { group: "Embed", items: [
    { label: "Title", max: LIMITS.embed.title },
    { label: "Description", max: LIMITS.embed.description },
    { label: "Fields", max: LIMITS.embed.fields },
    { label: "Field name", max: LIMITS.embed.fieldName },
    { label: "Field value", max: LIMITS.embed.fieldValue },
    { label: "Footer", max: LIMITS.embed.footer },
    { label: "Author name", max: LIMITS.embed.author },
  ]},
  { group: "Components", items: [
    { label: "Button label", max: LIMITS.component.buttonLabel },
    { label: "Custom ID", max: LIMITS.component.customId },
    { label: "Select options", max: LIMITS.component.selectOptions },
    { label: "Modal title", max: LIMITS.component.modalTitle },
    { label: "Modal inputs", max: LIMITS.component.modalInputs },
  ]},
  { group: "Commands", items: [
    { label: "Name", max: LIMITS.command.name },
    { label: "Description", max: LIMITS.command.description },
    { label: "Options", max: LIMITS.command.options },
    { label: "Choices", max: LIMITS.command.choices },
  ]},
];

export const EXAMPLE_MESSAGE = `{
  "content": "Hello from Nexus!",
  "embeds": [
    {
      "title": "Example embed",
      "description": "Paste any message, embed, command, or interaction JSON to validate limits.",
      "fields": [
        { "name": "Field", "value": "Value", "inline": true }
      ],
      "footer": { "text": "Nexus Limits" }
    }
  ]
}`;
