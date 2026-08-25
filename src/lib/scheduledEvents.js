/** Guild scheduled event JSON builder. */

export const ENTITY_TYPES = [
  { value: 1, label: "Stage channel", description: "Guild stage instance" },
  { value: 2, label: "Voice channel", description: "Guild voice channel" },
  { value: 3, label: "External", description: "Somewhere outside Discord" },
];

export const PRIVACY_LEVELS = [{ value: 2, label: "Guild only" }];

export const EVENT_STATUSES = [
  { value: 1, label: "Scheduled" },
  { value: 2, label: "Active" },
  { value: 3, label: "Completed" },
  { value: 4, label: "Canceled" },
];

export function createExampleEvent() {
  const start = new Date(Date.now() + 86400000);
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 2 * 3600000);

  return {
    name: "Community Meetup",
    description: "Hang out, share projects, and ask questions.",
    entityType: 2,
    channelId: "123456789012345678",
    entityMetadataLocation: "",
    privacyLevel: 2,
    scheduledStartTime: toLocalInputValue(start),
    scheduledEndTime: toLocalInputValue(end),
    image: "",
  };
}

export function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localInputToIso(value) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function buildScheduledEvent(state) {
  const entityType = Number(state.entityType) || 2;
  const event = {
    name: (state.name || "Scheduled Event").slice(0, 100),
    privacy_level: Number(state.privacyLevel) || 2,
    scheduled_start_time: localInputToIso(state.scheduledStartTime) || new Date().toISOString(),
    entity_type: entityType,
  };

  if (state.description?.trim()) {
    event.description = state.description.trim().slice(0, 1000);
  }

  if (entityType === 3) {
    event.entity_metadata = {
      location: (state.entityMetadataLocation || "TBD").slice(0, 100),
    };
    const end = localInputToIso(state.scheduledEndTime);
    if (end) event.scheduled_end_time = end;
  } else {
    event.channel_id = state.channelId || "0";
    const end = localInputToIso(state.scheduledEndTime);
    if (end) event.scheduled_end_time = end;
  }

  if (state.image?.trim()) {
    event.image = state.image.trim();
  }

  return event;
}
