module.exports.run = async (client, oldUser, newUser) => {
  try {
    if (!client.database?.ready) return;
    if (!oldUser || !newUser) return;

    const usernameChanged = oldUser.username !== newUser.username;
    const globalChanged =
      (oldUser.globalName ?? null) !== (newUser.globalName ?? null);
    const discriminatorChanged =
      String(oldUser.discriminator ?? "") !== String(newUser.discriminator ?? "");

    if (!usernameChanged && !globalChanged && !discriminatorChanged) return;

    const model = client.database.models.UsernameHistory;
    if (!model) return;

    // Record the previous identity at change time, then the new one.
    await model.observe(
      oldUser.id,
      {
        username: oldUser.username,
        globalName: oldUser.globalName,
        discriminator: oldUser.discriminator,
      },
      "userUpdate"
    );

    await model.observe(
      newUser.id,
      {
        username: newUser.username,
        globalName: newUser.globalName,
        discriminator: newUser.discriminator,
      },
      "userUpdate"
    );
  } catch (error) {
    client.errors?.(client, error.stack || error, "UserUpdate");
  }
};
