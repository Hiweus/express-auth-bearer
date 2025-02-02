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

describe('Auth:Can', () => {
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

  it('should allow user to access route when has permissions', async () => {
    mockVerify.mockReturnValueOnce({
      user: {
        id: 12,
      },
      type: 'access_token',
    })
    strategyMock.getUser.mockResolvedValueOnce({
      id: 12,
    })

    strategyMock.can.mockResolvedValueOnce(true)

    const mockNext = jest.fn()

    const request = {
      headers: {
        authorization: 'MY_TOKEN',
      },
      user: null,
    }
    const middleware = service.can(['add_user'])
    await middleware(
      request,
      mockResponse,
      mockNext,
    )

    expect(request.user).toEqual({ id: 12 })
    expect(mockNext).toHaveBeenCalledTimes(1)
  })
  it('should allow only access_token access', async () => {
    mockVerify.mockReturnValueOnce({
      user: {
        id: 12,
      },
      type: 'refresh_token',
    })

    const mockNext = jest.fn()

    const request = {
      headers: {
        authorization: 'MY_TOKEN',
      },
      user: null,
    }
    const middleware = service.can(['add_user'])
    await middleware(
      request,
      mockResponse,
      mockNext,
    )


    expect(mockNext).toHaveBeenCalledTimes(0)
    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Cannot use this token as access token',
    })
  })
  it('should deny when user has no access to resource', async () => {
    mockVerify.mockReturnValueOnce({
      user: {
        id: 12,
      },
      type: 'access_token',
    })

    strategyMock.can.mockResolvedValueOnce(false)

    const mockNext = jest.fn()

    const request = {
      headers: {
        authorization: 'MY_TOKEN',
      },
      user: null,
    }
    const middleware = service.can(['add_user'])
    await middleware(
      request,
      mockResponse,
      mockNext,
    )


    expect(mockNext).toHaveBeenCalledTimes(0)
    expect(mockResponse.status).toHaveBeenCalledWith(403)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Cannot access required resource',
    })
  })

  it('should reject request when token validation fails', async () => {
    mockVerify.mockImplementationOnce(() => {
      throw new Error('Nothing')
    })

    const consoleMock = jest.spyOn(global.console, 'log')
    consoleMock.mockImplementation()

    const mockNext = jest.fn()

    const request = {
      headers: {
        authorization: 'MY_TOKEN',
      },
      user: null,
    }

    const middleware = service.can(['add_user'])
    await middleware(
      request,
      mockResponse,
      mockNext,
    )

    consoleMock.mockRestore()

    expect(mockNext).toHaveBeenCalledTimes(0)
    expect(request.user).toBeNull()
    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    })
  })
})