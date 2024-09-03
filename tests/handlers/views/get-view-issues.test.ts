import { User } from '@prisma/client'
import { Request, Response } from 'express'

import getIssues from '@aces/handlers/views/get-view-issues'
import getViewIssues from '@aces/services/views/get-view-issues'


jest.mock('@aces/services/views/get-view-issues')
const mockGetViewIssues = getViewIssues as jest.Mock


describe('getIssues', () => {
  it('should return 400 if nextPage is not a string', async () => {
    const request = {
      session: {
        user: { id: '123', token: '456' } as User,
      },
      query: {
        nextPage: 123
      }
    } as unknown as Request
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    await getIssues(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({ errors: 'Invalid nextPage query parameter. nextPage must be undefined or a string' })
  })

  it('should return 401 if user is not authenticated', async () => {
    const request = {
      session: { user: null, },
      query: {}
    } as unknown as Request
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    await getIssues(request, response)
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.send).toHaveBeenCalled()
  })

  it('should return 401 if user has no token', async () => {
    const request = {
      session: { user: {}, },
      query: {}
    } as unknown as Request
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    await getIssues(request, response)
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.send).toHaveBeenCalled()
  })

  it('should return issues', async () => {
    const request = {
      session: {
        user: {
          id: '123',
          token: '456'
        }
      },
      params: {
        viewId: '789'
      },
      query: {
        page: '1'
      }
    } as unknown as Request
    const response = {
      json: jest.fn()
    } as unknown as Response
    const issues = [
      {
        id: '123',
        title: 'title',
        description: 'description',
        state: {
          name: 'name',
          type: 'type'
        },
        url: 'url'
      }
    ]
    mockGetViewIssues.mockResolvedValue(issues)
    await getIssues(request, response)
    expect(response.json).toHaveBeenCalledWith(issues)
  })
})
