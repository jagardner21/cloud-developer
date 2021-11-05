import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils'

const logger = createLogger('dataLayer')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const attachmentId = uuid.v4()
    let newItem: TodoItem

    const attachmentUploadUrl = createAttachmentPresignedUrl(attachmentId)

    try{
      newItem = await createTodo(newTodo, attachmentId, userId)
    } catch(e){
      logger.error('Error occurred while creating todo', {
        error: e
      })
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Error occurred while creating todo.'
        })
      }
    }
    

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        newItem,
        uploadUrl: attachmentUploadUrl
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
