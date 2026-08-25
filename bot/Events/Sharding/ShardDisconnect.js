module.exports.run = async (client, shardID) => {
    try {
        client.logger.log(client.modules.chalk.red(`SHARDING MANAGER`), `ShardID: ${shardID} - Disconnected.`);
    } catch (error) {
        return client.errors(client, error.stack, shardID, 'Event');
    }
};