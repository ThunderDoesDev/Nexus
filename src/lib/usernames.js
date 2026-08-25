/** Discord unique username rules (pomelo). */
const USERNAME_RE = /^[a-z0-9_.]{2,32}$/;

/**
 * Normalize and validate a Discord username.
 * Returns { username } or { error }.
 */
export function parseUsername(value) {
  if (value == null) return { error: "Enter a Discord username." };
  const raw = String(value).trim().replace(/^@+/, "");
  if (!raw) return { error: "Enter a Discord username." };

  const username = raw.toLowerCase();

  if (username.length < 2 || username.length > 32) {
    return { error: "Username must be between 2 and 32 characters." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      error: "Only lowercase letters, numbers, underscores, and periods are allowed.",
    };
  }
  if (username.includes("..")) {
    return { error: "Username cannot contain consecutive periods." };
  }
  if (username.includes("discord")) {
    return { error: 'Username cannot contain "discord".' };
  }
  if (username === "everyone" || username === "here") {
    return { error: "That username is reserved." };
  }

  return { username };
}

export function formatUsernameCheck(username, taken) {
  return {
    username,
    handle: `@${username}`,
    taken: Boolean(taken),
    available: !taken,
    status: taken ? "taken" : "available",
  };
}
