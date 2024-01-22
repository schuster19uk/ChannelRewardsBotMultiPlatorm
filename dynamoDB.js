
const { DynamoDBClient, CreateTableCommand,DescribeTableCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

class DynamoDBManager {
  constructor(region, twitchTableName, youtubeTableName) {
    this.dynamoDB = new DynamoDBClient({ region });
    this.twitchTableName = twitchTableName;
    this.youtubeTableName = youtubeTableName;
  }

  async initializeDatabase(twitchTableSettings, youtubeTableSettings) {
    // You might perform any additional initialization tasks here
    try {
      console.log(`Attempting to create Twitch users table '${this.twitchTableName}'`);
      await this.createTable(twitchTableSettings);
    } catch (error) {
      console.error('Error creating Twitch users table:', error);
    }

    try {
      console.log(`Attempting to create Youtube users table '${this.youtubeTableName}'`);
      await this.createTable(youtubeTableSettings);
    } catch (error) {
      console.error('Error creating YouTube users table:', error);
    }

    console.log('Connected to DynamoDB');
  }

async createTable(tableSettings) {
  try {
      // Check if the table already exists
      await this.describeTable(tableSettings.name);

      // Table exists, do nothing or handle as needed
      console.log(`Table '${tableSettings.name}' already exists.`);
  } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
          // Table does not exist, proceed with creation
          const command = new CreateTableCommand({
            TableName: tableSettings.name,
            KeySchema: [
                { AttributeName: 'user_id', KeyType: 'HASH' }, // Partition key
            ],
            AttributeDefinitions: [
                { AttributeName: 'user_id', AttributeType: 'N' }, // Assuming user_id is a number
                { AttributeName: 'username', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: tableSettings.readCapacity || 5,
                WriteCapacityUnits: tableSettings.writeCapacity || 5,
            },
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'UsernameIndex', // Choose a meaningful name for your index
                    KeySchema: [
                        { AttributeName: 'username', KeyType: 'HASH' },
                    ],
                    Projection: {
                        ProjectionType: 'ALL', // You can adjust this based on your needs
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5, // Adjust based on your read requirements
                        WriteCapacityUnits: 5, // Adjust based on your write requirements
                    },
                },
            ],
        });



          try {
              const response = await this.dynamoDB.send(command);
              console.log(`Table '${tableSettings.name}' created successfully. Response:`, response);
          } catch (createError) {
              console.error(`Error creating table '${tableSettings.name}':`, createError);
          }
      } else {
          // Unexpected error
          console.error('Error checking table existence:', error);
      }
  }
}

async describeTable(tableName) {
  const command = new DescribeTableCommand({ TableName: tableName });

  try {
      return await this.dynamoDB.send(command);
  } catch (error) {
      throw error;
  }
}

  async addPointsToTwitchUser(username, pointsToAdd, userId, messageId, displayName) {
    const params = {
      TableName: this.twitchTableName,
      Key: { user_id: { N: userId } },
        ':userName': { S: username },
        UpdateExpression: 'SET points = if_not_exists(points, :zero) + :points, message_id = :messageId, username = :userName, display_name = :displayName',
      ExpressionAttributeValues: {
        ':points': { N: pointsToAdd.toString() },
        ':zero': { N: '0' },
        ':messageId': { S: messageId },
        ':userName': { S: username },
        ':displayName': { S: displayName },
      },
      ReturnValues: 'ALL_NEW', // Change this if you want to get different information after the update
    };

    try {
      const command = new UpdateItemCommand(params);
      const result = await this.dynamoDB.send(command);
      console.log(`Updated points for Twitch user (${username}):`, result.Attributes);
    } catch (error) {
      console.error('Error updating points for Twitch user:', error);
      throw error;
    }
  }

  async addPointsToYoutubeUser(username, pointsToAdd) {
    const params = {
      TableName: this.youtubeTableName,
      Key: { username: { S: username } },
      UpdateExpression: 'SET points = if_not_exists(points, :zero) + :points',
      ExpressionAttributeValues: {
        ':points': { N: pointsToAdd.toString() },
        ':zero': { N: '0' },
      },
      ReturnValues: 'ALL_NEW', // Change this if you want to get different information after the update
    };

    try {
      const command = new UpdateItemCommand(params);
      const result = await this.dynamoDB.send(command);
      console.log(`Points added to YouTube user (${username}):`, result.Attributes);
    } catch (error) {
      console.error('Error updating points for YouTube user:', error);
      throw error;
    }
  }

  // ... Other methods
}

module.exports = DynamoDBManager;