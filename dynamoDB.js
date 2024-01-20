require('dotenv').config(); // Load environment variables from .env file

const { DynamoDB } = require('aws-sdk');

class DynamoDBManager {
  constructor(region, twitchTableName, youtubeTableName) {
    this.dynamoDB = new DynamoDB({ region });
    this.twitchTableName = twitchTableName;
    this.youtubeTableName = youtubeTableName;
  }

  async initializeDatabase() {
    await this.createTwitchUsersTable();
    await this.createYoutubeUsersTable();

    // You might perform any additional initialization tasks here
    console.log('Connected to DynamoDB');
  }

  async createTwitchUsersTable() {
    const params = {
      TableName: this.twitchTableName,
      KeySchema: [
        { AttributeName: 'user_id', KeyType: 'HASH' }, // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'user_id', AttributeType: 'N' }, // Assuming user_id is a number
        { AttributeName: 'username', AttributeType: 'S' },
        // ... add other attribute definitions as needed
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5, // Adjust based on your read requirements
        WriteCapacityUnits: 5, // Adjust based on your write requirements
      },
      GlobalSecondaryIndexes: [
        // Optional: Add global secondary indexes if needed
      ],
      // ... add other table settings as needed
    };

    try {
      await this.dynamoDB.createTable(params).promise();
      console.log(`Twitch users table '${this.twitchTableName}' created successfully.`);
    } catch (error) {
      console.error('Error creating Twitch users table:', error);
    }
  }

  async createYoutubeUsersTable() {
    const params = {
      TableName: this.youtubeTableName,
      KeySchema: [
        { AttributeName: 'user_id', KeyType: 'HASH' }, // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'user_id', AttributeType: 'N' }, // Assuming user_id is a number
        { AttributeName: 'username', AttributeType: 'S' },
        // ... add other attribute definitions as needed
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5, // Adjust based on your read requirements
        WriteCapacityUnits: 5, // Adjust based on your write requirements
      },
      GlobalSecondaryIndexes: [
        // Optional: Add global secondary indexes if needed
      ],
      // ... add other table settings as needed
    };

    try {
      await this.dynamoDB.createTable(params).promise();
      console.log(`YouTube users table '${this.youtubeTableName}' created successfully.`);
    } catch (error) {
      console.error('Error creating YouTube users table:', error);
    }
  }

  async addPointsToTwitchUser(username, pointsToAdd, userId, messageId, displayName) {
    const params = {
      TableName: this.twitchTableName,
      Key: { username: username },
      UpdateExpression: 'SET points = if_not_exists(points, :zero) + :points, message_id = :messageId, display_name = :displayName',
      ExpressionAttributeValues: {
        ':points': pointsToAdd,
        ':zero': 0,
        ':messageId': messageId,
        ':displayName': displayName,
      },
      ReturnValues: 'ALL_NEW', // Change this if you want to get different information after the update
    };

    try {
      const result = await this.dynamoDB.update(params).promise();
      console.log(`Updated points for Twitch user (${username}):`, result.Attributes);
    } catch (error) {
      console.error('Error updating points for Twitch user:', error);
    }
  }

  async addPointsToYoutubeUser(username, pointsToAdd) {
    const params = {
      TableName: this.youtubeTableName,
      Key: { username: username },
      UpdateExpression: 'SET points = if_not_exists(points, :zero) + :points',
      ExpressionAttributeValues: {
        ':points': pointsToAdd,
        ':zero': 0,
      },
      ReturnValues: 'ALL_NEW', // Change this if you want to get different information after the update
    };

    try {
      const result = await this.dynamoDB.update(params).promise();
      console.log(`Points added to YouTube user (${username}):`, result.Attributes);
    } catch (error) {
      console.error('Error updating points for YouTube user:', error);
    }
  }

  async closeDatabaseConnection() {
    // In DynamoDB, you don't need to explicitly close connections like you do in traditional databases.
    // The AWS SDK manages connections and resources for you.
    console.log('DynamoDB connection remains open (managed by AWS SDK)');
  }
}

module.exports = DynamoDBManager;