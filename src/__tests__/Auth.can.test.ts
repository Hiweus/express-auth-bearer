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
    publicKey: "-----BEGIN PUBLIC KEY-----\nMIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBVSLw/lWsi3VqLQqyLY0vB\nL+8C/FKlheXmtbFwKKMIr2pzGaocIWD73X5uZNjB23VTEhUAs7W9I7BS+IZT4gZM\nXsXIPXYi9a4fzZ8rqI60qHHD8tN4PvaXy/IZxTn3FqUEewPrDpPnQ8NHYXuyiBZ4\nDBpoylFXVFxB1WdSMmrG31CWl9Z8aihVw82XMt/IVOFFVIRtvzKQ0ZvtdbjJzGtB\ntyWwnotUJwO7nUVAbz+OWKaSWL9lKAGnf9IpLa6w8O2l9VbGhbkLkB07PWiOZY9t\nd44UVcvbkb6VAEi5DZe9X3VdLUMsLnr6pMbPRkgbhYj+5SHMHm8mh0qGPVF3Qq0L\nRyNWMfiJOHHDGB4hKyEzz75TJL84GVFtyOekr1h5wSluBz9EFQitpp4n2M3AJoVh\nGvtnci4osMIgJBr1gJdk0pkCViwv5qaf9i9gp9m+iJv0RKmFyqi5bRkPoEHywF4J\nL8VG7VKjLRxDH3/6nAeGtojXKqtAiRT8/dSoq4MhRwRdgatCIWY+dCidw6YLLsrM\nqSeHggqROpV3ZUAlNBXgMnaClpV7U8tZOpuUW18GcT50EqcrXWPTI39bopHXHi9Z\n37kfXL8lfWr0KLguB1u+0iCSSBiKih/TZSEsdvO7Jnk2CTThEinfEGNKINTk23g4\nIQLxevEcJQfY08IVjUcEQwIDAQAB\n-----END PUBLIC KEY-----",
    privateKey: "-----BEGIN RSA PRIVATE KEY-----\n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\n-----END RSA PRIVATE KEY-----",
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