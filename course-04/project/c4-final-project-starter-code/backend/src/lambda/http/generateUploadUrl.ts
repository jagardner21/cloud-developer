import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const logger = createLogger('generateUploadUrl')
const bucket = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    // check for missing todo id
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'todoId was not provided'})
      }
    }

    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: bucket,
      Key: `${todoId}.png`,
      Expires: 300
    })
    logger.info(`Generated signed url for a TODO`, {
      url: signedUrl,
      todoId: todoId
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)