module.exports.run = async (client, shardID) => {
    try {
        client.logger.log(client.modules.chalk.green(`SHARDING MANAGER`), `ShardID: ${shardID} - Resumed.`);
    } catch (error) {
        return client.errors(client, error.stack, shardID, 'Event');
    }
};