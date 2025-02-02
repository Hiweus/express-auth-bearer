const mockVerify = jest.fn().mockReturnValue({
  user: {
    id: 12,
  },
  type: 'refresh_token',
})

import { Auth } from ".."

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: mockVerify,
}))

describe('Auth:Login', () => {
  const strategyMock = {
    login: jest.fn(),
    getUser: jest.fn(),
    can: jest.fn(),
  }

  const service = new Auth({
    publicKey: `${process.env.PUBLIC_KEY}`,
    privateKey: `${process.env.SECRET_KEY}`,
    strategy: strategyMock,
  })

  const mockResponse = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle login successfully', async () => {
    strategyMock.login.mockResolvedValueOnce({
      id: 12,
      login: 'test',
    })

    const executer = service.login()
    await executer(
      {
        body: {
          login: 'user',
          password: 'user',
        },
        headers: {},
      },
      mockResponse,
    )

    expect(mockResponse.status).not.toHaveBeenCalled()
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: expect.anything(),
      refreshToken: expect.anything(),
    }))
  })
  it('should reject user with invalid credentials', async () => {
    strategyMock.login.mockResolvedValueOnce(null)
    const executer = service.login()
    await executer(
      {
        body: {},
        headers: {}
      },
      mockResponse,
    )

    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid credentials',
    })
  })
  it('should not break when body is empty', async () => {
    strategyMock.login.mockResolvedValueOnce(null)

    await service.login()(
      {
        headers: {},
      },
      mockResponse,
    )

    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.json).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledTimes(1)
  })
})