module.exports.run = async (client, shardID, error) => {
    try {
        client.logger.error(client.modules.chalk.red(`SHARDING MANAGER`), `ShardID: ${shardID} - Error: ${error.message}`);
    } catch (error) {
        return client.errors(client, error.stack, shardID, 'Event');
    }
};