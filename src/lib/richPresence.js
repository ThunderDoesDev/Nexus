/** Gateway presence / rich presence activity payload builder. */

export const STATUS_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "idle", label: "Idle" },
  { value: "dnd", label: "Do Not Disturb" },
  { value: "invisible", label: "Invisible" },
];

export const ACTIVITY_TYPES = [
  { value: 0, label: "Playing", prefix: "Playing" },
  { value: 1, label: "Streaming", prefix: "Streaming" },
  { value: 2, label: "Listening", prefix: "Listening to" },
  { value: 3, label: "Watching", prefix: "Watching" },
  { value: 4, label: "Custom", prefix: "" },
  { value: 5, label: "Competing", prefix: "Competing in" },
];

export function createExamplePresence() {
  return {
    status: "online",
    afk: false,
    since: "",
    activityEnabled: true,
    type: 0,
    name: "Nexus",
    state: "Building Discord tools",
    details: "",
    url: "",
    applicationId: "",
    largeImage: "",
    largeText: "",
    smallImage: "",
    smallText: "",
    buttons: [],
  };
}

export function buildActivity(state) {
  if (!state.activityEnabled) return null;

  const type = Number(state.type) || 0;
  const activity = { type };

  if (type === 4) {
    activity.name = "Custom Status";
    activity.state = (state.state || state.name || "").slice(0, 128);
  } else {
    activity.name = (state.name || "Activity").slice(0, 128);
    if (state.state?.trim()) activity.state = state.state.trim().slice(0, 128);
    if (state.details?.trim()) activity.details = state.details.trim().slice(0, 128);
  }

  if (type === 1 && state.url?.trim()) {
    activity.url = state.url.trim();
  }

  if (state.applicationId?.trim()) {
    activity.application_id = state.applicationId.trim();
  }

  const assets = {};
  if (state.largeImage?.trim()) assets.large_image = state.largeImage.trim();
  if (state.largeText?.trim()) assets.large_text = state.largeText.trim().slice(0, 128);
  if (state.smallImage?.trim()) assets.small_image = state.smallImage.trim();
  if (state.smallText?.trim()) assets.small_text = state.smallText.trim().slice(0, 128);
  if (Object.keys(assets).length) activity.assets = assets;

  return activity;
}

export function buildPresenceUpdate(state) {
  const activities = [];
  const activity = buildActivity(state);
  if (activity) activities.push(activity);

  const payload = {
    op: 3,
    d: {
      since: state.since?.trim() ? Number(state.since) : null,
      activities,
      status: state.status || "online",
      afk: Boolean(state.afk),
    },
  };

  return payload;
}

export function buildBotPresenceOptions(state) {
  const activity = buildActivity(state);
  return {
    status: state.status === "invisible" ? "invisible" : state.status || "online",
    afk: Boolean(state.afk),
    activities: activity ? [activity] : [],
  };
}

export function presencePreviewLabel(state) {
  if (!state.activityEnabled) return state.status || "online";
  const meta = ACTIVITY_TYPES.find((t) => t.value === Number(state.type));
  if (Number(state.type) === 4) {
    return state.state || state.name || "Custom Status";
  }
  const name = state.name || "Activity";
  return meta?.prefix ? `${meta.prefix} ${name}` : name;
}
