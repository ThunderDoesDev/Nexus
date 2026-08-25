const DISCORD_EPOCH = 1420070400000n;

export function decodeSnowflake(id) {
  const trimmed = id?.trim();
  if (!trimmed || !/^\d{17,20}$/.test(trimmed)) {
    return null;
  }

  const snowflake = BigInt(trimmed);
  const timestamp = Number((snowflake >> 22n) + DISCORD_EPOCH);
  const workerId = Number((snowflake >> 17n) & 0x1fn);
  const processId = Number((snowflake >> 12n) & 0x1fn);
  const increment = Number(snowflake & 0xfffn);

  return {
    id: trimmed,
    timestamp,
    createdAt: new Date(timestamp),
    workerId,
    processId,
    increment,
    binary: snowflake.toString(2).padStart(64, "0"),
  };
}

export function encodeSnowflake(timestampMs, workerId = 0, processId = 0, increment = 0) {
  const ts = BigInt(timestampMs) - DISCORD_EPOCH;
  const snowflake = (ts << 22n) | (BigInt(workerId) << 17n) | (BigInt(processId) << 12n) | BigInt(increment);
  return snowflake.toString();
}
