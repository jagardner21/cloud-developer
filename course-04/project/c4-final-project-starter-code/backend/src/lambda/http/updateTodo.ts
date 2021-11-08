import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
// import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId: string = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    const success = await updateTodo(userId, todoId, updatedTodo)


    if(!success){
      return {
        statusCode: 500,
        body: "Error occurred while updating Todo."
      }
    }

    return {
      statusCode: 200,
      body: `Successfully updated todo id: ${todoId}`
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
