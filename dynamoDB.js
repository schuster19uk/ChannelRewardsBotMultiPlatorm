//TODO !checkTwitch , !checkYT commands to return if their accounts match.
const { DynamoDBClient, CreateTableCommand,DescribeTableCommand, UpdateItemCommand ,QueryCommand } = require('@aws-sdk/client-dynamodb');

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

  async addDiscordInfoToTwitchUser(username, discordID, discordUsername, avatarURL) {
    // Check if the user already has a discordID
    const existingUser = await this.getTwitchUserByUsername(username);
    if (existingUser && existingUser.Items && existingUser.Items.length > 0 && existingUser.Items[0].discordID && existingUser.Items[0].discordID.S) {
        return (`Twitch user (${username}) has already been associated with a discord username. Use !checkTwitch yourTwitchUserName to see if your Twitch Username is associated with your discord account.`);
    }

    if (existingUser.Count <= 0)
    {
      return `Twitch user (${username}) has not interacted in twitch chat`;
    }

    const params = {
        TableName: this.twitchTableName,
        IndexName: 'UsernameIndex', // Name of the GSI
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': { S: username },
        },
    };

    try {
        const command = new QueryCommand(params);
        const result = await this.dynamoDB.send(command);
        if (result.Items && result.Items.length > 0) {
            const updateParams = {
                TableName: this.twitchTableName,
                Key: { user_id: { N: result.Items[0].user_id.N } },
                UpdateExpression: 'SET discordID = :discordID, discordUsername = :discordUsername',
                ExpressionAttributeValues: {
                    ':discordID': { S: discordID },
                    ':discordUsername': { S: discordUsername },
                },
                ReturnValues: 'ALL_NEW',
            };
            const updateCommand = new UpdateItemCommand(updateParams);
            const updateResult = await this.dynamoDB.send(updateCommand);
            console.log(`Discord info added to Twitch user (${username}):`, updateResult.Attributes);
            return 'OK';
          } else {
          return (`Twitch user (${username}) not found.`);
          //throw new Error(`Twitch user (${username}) not found.`);
        }
    } catch (error) {
        console.error('Error adding Discord info to Twitch user:', error);
        return('Error adding Discord info to Twitch user:', error);
    }
}

async getTwitchUserByUsername(username) {
    const params = {
        TableName: this.twitchTableName,
        IndexName: 'UsernameIndex', // Name of the GSI
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': { S: username },
        },
    };

    try {
        const command = new QueryCommand(params);
        return await this.dynamoDB.send(command);
    } catch (error) {
        console.error('Error getting Twitch user by username:', error);
        throw error;
    }
}

async addDiscordInfoToYoutubeUser(username, discordID, discordUsername, avatarURL) {
  // Check if the user already has a discordID

  const existingUser = await this.getYoutubeUserByUsername(username);
  if (existingUser && existingUser.Items && existingUser.Items.length > 0 && existingUser.Items[0].discordID && existingUser.Items[0].discordID.S) {
      return (`YouTube user (${username}) has already been associated with a discord username. Use !checkYT yourYTUserName to see if your YTUsername is associated with your discord account.`);
  }

  if (existingUser.Count <= 0)
  {
    return `YouTube user (${username}) has not interacted in YouTube chat`;
  }


  const params = {
      TableName: this.youtubeTableName,
      IndexName: 'UsernameIndex', // Name of the GSI
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
          ':username': { S: username },
      },
  };

  try {
      const command = new QueryCommand(params);
      const result = await this.dynamoDB.send(command);
      if (result.Items && result.Items.length > 0) {
          const updateParams = {
              TableName: this.youtubeTableName,
              Key: { user_id: { N: result.Items[0].user_id.N } },
              UpdateExpression: 'SET discordID = :discordID, discordUsername = :discordUsername',
              ExpressionAttributeValues: {
                  ':discordID': { S: discordID },
                  ':discordUsername': { S: discordUsername },
              },
              ReturnValues: 'ALL_NEW',
          };
          const updateCommand = new UpdateItemCommand(updateParams);
          const updateResult = await this.dynamoDB.send(updateCommand);
          console.log(`Discord info added to YouTube user (${username}):`, updateResult.Attributes);
          return 'OK';
      } else {
         return(`YouTube user (${username}) not found.`);
      }
  } catch (error) {
      console.log(`Discord info added to YouTube user (${username}):`, updateResult.Attributes);
      return('Error adding Discord info to YouTube user:', error);
  }
}

async getYoutubeUserByUsername(username) {
  const params = {
      TableName: this.youtubeTableName,
      IndexName: 'UsernameIndex', // Name of the GSI
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
          ':username': { S: username },
      },
  };

  try {
      const command = new QueryCommand(params);
      return await this.dynamoDB.send(command);
  } catch (error) {
      console.error('Error getting YouTube user by username:', error);
      throw error;
  }
}

  async addPointsToYoutubeUser(username, pointsToAdd, userId, messageId, displayName) {
    const params = {
      TableName: this.youtubeTableName,
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
      console.log(`Updated points for YouTube user (${username}):`, result.Attributes);
    } catch (error) {
      console.error('Error updating points for YouTube user:', error);
      throw error;
    }
  }

}

module.exports = DynamoDBManager;