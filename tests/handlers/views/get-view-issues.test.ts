import { Response } from 'express'

import getIssues from '@aces/handlers/views/get-view-issues'
import Request from '@aces/interfaces/request'
import getViewIssues from '@aces/services/views/get-view-issues'


jest.mock('@aces/services/views/get-view-issues')
const mockGetViewIssues = getViewIssues as jest.Mock


describe('getIssues', () => {
  it('should return 401 if user is not authenticated', async () => {
    const request = {
      user: null
    } as unknown as Request
    const response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    await getIssues(request, response)
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.send).toHaveBeenCalledWith('Unauthorized')
  })

  it('should return issues', async () => {
    const request = {
      user: {
        id: '123',
        token: '456'
      },
      params: {
        viewId: '789'
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
