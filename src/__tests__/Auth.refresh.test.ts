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

describe('Auth:Refresh', () => {

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
    strategyMock.getUser.mockResolvedValueOnce({
      id: 12,
    })

    await service.refresh()(
      {
        headers: {
          authorization: 'Bearer MY_TOKEN',
        },
      },
      mockResponse,
    )

    expect(mockVerify).toHaveBeenCalledTimes(1)
    expect(strategyMock.getUser).toHaveBeenCalledWith(12)
    expect(mockResponse.json).toHaveBeenCalledWith({
      accessToken: expect.anything(),
    })
  })

  it('should allow only refresh tokens', async () => {
    mockVerify.mockReturnValueOnce({
      user: {
        id: 12,
      },
      type: 'access_token',
    })

    await service.refresh()(
      {
        headers: {
          authorization: 'MY_TOKEN',
        },
      },
      mockResponse,
    )

    expect(mockVerify).toHaveBeenCalledWith(
      'MY_TOKEN',
      expect.anything(),
      expect.anything(),
    )
    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Cannot use this token as refresh token',
    })
  })

  it('should allow only existing users to renew token', async () => {
    strategyMock.getUser.mockResolvedValueOnce(null)

    await service.refresh()(
      {
        headers: {
          authorization: 'MY_TOKEN'
        }
      },
      mockResponse,
    )

    expect(mockVerify).toHaveBeenCalledWith(
      'MY_TOKEN',
      expect.anything(),
      expect.anything(),
    )
    expect(mockResponse.status).toHaveBeenCalledWith(403)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Cannot refresh this token',
    })
  })


  it('should not break when token is missing', async () => {
    mockVerify.mockImplementationOnce(() => {
      throw new Error('Invalid token')
    })

    await service.refresh()(
      {
        headers: {}
      },
      mockResponse,
    )

    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    })
  })
})