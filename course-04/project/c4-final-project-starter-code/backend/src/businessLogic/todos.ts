import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoData } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import * as AWS  from 'aws-sdk'

const todoData = new TodoData()

// export async function createAttachmentPresignedUrl(attachmentId: string){
//     return todoData.createAttachmentPresignedUrl(attachmentId)
// }

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return await todoData.getTodosForUser(userId)
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
  return todoData.getTodo(userId, todoId)
}

export async function deleteTodo(userId: string, todoId: string): Promise<Boolean> {
  return todoData.deleteTodo(userId, todoId)
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<Boolean> {
  return todoData.updateTodo(userId, todoId, updatedTodo)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest, attachmentId: string,
  userId: string
): Promise<TodoItem> {
     
  const bucketName = process.env.ATTACHMENT_S3_BUCKET

  return await todoData.createTodo({
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
  })
}