import { Router } from 'express'

import appRouter from '@aces/routes/index'


jest.mock('express', () => ({
  Router: jest.fn(() => ({
    use: jest.fn(),
  }))
}))

jest.mock('@aces/routes/auth', () => 'mocked-auth-router')
jest.mock('@aces/routes/rounds', () => 'mocked-rounds-router')
jest.mock('@aces/routes/views', () => 'mocked-views-router')

describe('appRouter', () => {
  it('should set up routes correctly', () => {
    const mockUse = (appRouter as Router).use

    expect(mockUse).toHaveBeenCalledTimes(3)

    expect(mockUse).toHaveBeenNthCalledWith(1, '/auth', 'mocked-auth-router')
    expect(mockUse).toHaveBeenNthCalledWith(2, '/rounds', 'mocked-rounds-router')
    expect(mockUse).toHaveBeenNthCalledWith(3, '/views', 'mocked-views-router')
  })
})
