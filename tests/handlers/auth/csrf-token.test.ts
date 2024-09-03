import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getCsrfToken from '@aces/handlers/auth/csrf-token'
import { generateCsrfToken } from '@aces/util/generate-csrf-token'


jest.mock('@aces/util/generate-csrf-token')
const mockGenerateCsrfToken = generateCsrfToken as jest.MockedFunction<typeof generateCsrfToken>


let mockRequest: Partial<Request>
let mockResponse: Partial<Response>

beforeEach(() => {
  mockRequest = {}
  mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }
})

describe('getCsrfToken function', () => {
  it('should respond with OK status code and a csrf token', () => {
    mockGenerateCsrfToken.mockReturnValue('test-csrf-token')
    getCsrfToken(mockRequest as Request, mockResponse as Response)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)

    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      csrfToken: 'test-csrf-token',
    }))
  })
})
