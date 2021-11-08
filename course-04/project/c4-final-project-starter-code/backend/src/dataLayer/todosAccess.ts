import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
const logger = createLogger('dataLayer')
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new AWS.DynamoDB.DocumentClient()
}

export class TodoData {
  constructor(
    private readonly dynamoDBClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableIndex = process.env.USER_ID_INDEX
  ) {
  }

  // async createAttachmentPresignedUrl(attachmentId: string){
  //   const s3 = new AWS.S3({
  //       signatureVersion: "v4"
  //   })
  //   return s3.getSignedUrl('putObject', {
  //       Bucket: process.env.ATTACHMENT_S3_BUCKET,
  //       Key: attachmentId,
  //       Expires: 300
  //     })
  // }

  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.dynamoDBClient.get({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }).promise()

    return result.Item as TodoItem
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting Todos for user id: ${userId}`)
    const result = await this.dynamoDBClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosTableIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    logger.info(`There are ${result.Count} Todos for user id: ${userId}.`)
    return result.Items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.dynamoDBClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    logger.info(`Created todo ${todo.todoId} for user ${todo.userId}.`)
    return todo
  }

  async updateTodo(userId: string, todoId: string, todo: UpdateTodoRequest): Promise<Boolean> {
    let isSuccess = false
    try {
      await this.dynamoDBClient
        .update({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId
          },
          UpdateExpression:
            'set #name = :name, #dueDate = :duedate, #done = :done',
          ExpressionAttributeValues: {
            ':name': todo.name,
            ':duedate': todo.dueDate,
            ':done': todo.done
          },
          ExpressionAttributeNames: {
            '#name': 'name',
            '#dueDate': 'dueDate',
            '#done': 'done'
          }
        }).promise()
        isSuccess = true
    } catch (e) {
      logger.error('Error occurred while updating Todo.', {
        error: e,
        data: {
          userId,
          todoId,
          todo
        }
      })
    }

    return isSuccess
  }

  async deleteTodo(userId: string, todoId: string): Promise<Boolean> {
    let success = false
    try {
      await this.dynamoDBClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise()
      logger.info(`Successfully deleted Todo ${todoId}`)
      success = true
    } catch (e) {
      logger.info('Error occurred while deleting Todo from database', {error: e})
    }
    return success
  }
}