export const COMMAND_TYPES = [
  { value: 1, label: "Slash Command", key: "CHAT_INPUT" },
  { value: 2, label: "User Command", key: "USER" },
  { value: 3, label: "Message Command", key: "MESSAGE" },
];

export const OPTION_TYPES = [
  { value: 1, label: "Subcommand" },
  { value: 2, label: "Subcommand Group" },
  { value: 3, label: "String" },
  { value: 4, label: "Integer" },
  { value: 5, label: "Boolean" },
  { value: 6, label: "User" },
  { value: 7, label: "Channel" },
  { value: 8, label: "Role" },
  { value: 9, label: "Mentionable" },
  { value: 10, label: "Number" },
  { value: 11, label: "Attachment" },
];

const CHOICE_TYPES = new Set([3, 4, 10]);
const NESTED_TYPES = new Set([1, 2]);

export function supportsChoices(type) {
  return CHOICE_TYPES.has(type);
}

export function isNestedOption(type) {
  return NESTED_TYPES.has(type);
}

export function validateCommandName(name) {
  if (!name) return "Name is required.";
  if (name.length > 32) return "Name must be 32 characters or fewer.";
  if (!/^[a-z0-9_-]+$/.test(name)) return "Name must be lowercase letters, numbers, hyphens, or underscores.";
  return null;
}

export function validateOptionName(name, siblings = []) {
  const base = validateCommandName(name);
  if (base) return base;
  if (siblings.filter((n) => n === name).length > 1) return "Option names must be unique at this level.";
  return null;
}

function buildChoice(choice) {
  const entry = { name: choice.name, value: choice.value };
  if (choice.nameLocalizations?.trim()) {
    try {
      entry.name_localizations = JSON.parse(choice.nameLocalizations);
    } catch {
      /* ignore invalid JSON */
    }
  }
  return entry;
}

function coerceChoiceValue(type, value) {
  if (type === 4) return parseInt(value, 10);
  if (type === 10) return parseFloat(value);
  return value;
}

function buildOption(option) {
  const result = {
    type: option.type,
    name: option.name,
    description: option.description,
  };

  if (option.descriptionLocalizations?.trim()) {
    try {
      result.description_localizations = JSON.parse(option.descriptionLocalizations);
    } catch {
      /* ignore */
    }
  }
  if (option.nameLocalizations?.trim()) {
    try {
      result.name_localizations = JSON.parse(option.nameLocalizations);
    } catch {
      /* ignore */
    }
  }

  if (isNestedOption(option.type)) {
    if (option.options?.length) {
      result.options = option.options.map(buildOption);
    }
    return result;
  }

  if (option.required) result.required = true;
  if (option.autocomplete) result.autocomplete = true;

  if (supportsChoices(option.type) && option.choices?.length) {
    result.choices = option.choices
      .filter((c) => c.name && c.value !== "")
      .map((c) => ({
        ...buildChoice(c),
        value: coerceChoiceValue(option.type, c.value),
      }));
  }

  if (option.type === 3) {
    if (option.minLength) result.min_length = Number(option.minLength);
    if (option.maxLength) result.max_length = Number(option.maxLength);
  }

  if (option.type === 4 || option.type === 10) {
    if (option.minValue !== "") result.min_value = Number(option.minValue);
    if (option.maxValue !== "") result.max_value = Number(option.maxValue);
  }

  if (option.type === 7 && option.channelTypes?.length) {
    result.channel_types = option.channelTypes;
  }

  return result;
}

export function buildCommandJson(command) {
  const payload = {
    name: command.name,
    description: command.description,
    type: command.type,
  };

  if (command.descriptionLocalizations?.trim()) {
    try {
      payload.description_localizations = JSON.parse(command.descriptionLocalizations);
    } catch {
      /* ignore */
    }
  }
  if (command.nameLocalizations?.trim()) {
    try {
      payload.name_localizations = JSON.parse(command.nameLocalizations);
    } catch {
      /* ignore */
    }
  }

  if (command.type === 1 && command.options?.length) {
    payload.options = command.options.map(buildOption);
  }

  if (command.dmPermission === false) payload.dm_permission = false;
  if (command.nsfw) payload.nsfw = true;
  if (command.defaultMemberPermissions?.trim()) {
    payload.default_member_permissions = command.defaultMemberPermissions.trim();
  }

  return payload;
}

export function getRegisterEndpoint(applicationId, guildId) {
  if (!applicationId) return "";
  if (guildId?.trim()) {
    return `POST /applications/${applicationId}/guilds/${guildId.trim()}/commands`;
  }
  return `POST /applications/${applicationId}/commands`;
}
