import jwt from 'jsonwebtoken'

export interface IAuthStrategy {
  login: (credentials: Record<string, string>) => Promise<Record<string, unknown> | null>
  getUser: (id: string) => Promise<Record<string, unknown> | null>
  can: (actions: string[], userInfo: Record<string, unknown>) => Promise<boolean>
}

export type TokenBasePayload = {
  type: string
  user: {
    id: string
  }
}

export interface IAuthConstructor {
  publicKey: string
  privateKey: string
  strategy: IAuthStrategy
}

export interface IRequest {
  headers: Record<string, string>
  body?: Record<string, unknown>
  user?: Record<string, unknown>
}

export interface IResponse {
  status: (code: number) => IResponse
  json: (data: Record<string, unknown>) => void
}

export class Auth {
  publicKey: string
  privateKey: string
  strategy: IAuthStrategy
  
  constructor({ publicKey, privateKey, strategy }: IAuthConstructor) {
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.strategy = strategy
  }

  async generateAccessToken(user: Record<string, unknown>) {
    const payload = {
      type: 'access_token',
      user,
    }
    const token = jwt.sign(payload, this.privateKey, { algorithm: 'RS256', expiresIn: '1h' })
    return token
  }

  async generateRefreshToken(user: Record<string, unknown>) {
    const payload = {
      type: 'refresh_token',
      user: {
        id: user.id,
      }
    }
    const token = jwt.sign(payload, this.privateKey, { algorithm: 'RS256', expiresIn: '30d' })
    return token
  }

  login() {
    return async (request: IRequest, response: IResponse) => {
      const user = await this.strategy.login((request.body ?? {}) as Record<string, string>)
      if (!user) {
        return response.status(401).json({ message: 'Invalid credentials' })
      }
      const accessToken = await this.generateAccessToken(user)
      const refreshToken = await this.generateRefreshToken(user)

      return response.json({ accessToken, refreshToken })
    }
  }

  refresh() {
    return async (request: IRequest, response: IResponse) => {
      try {
        const refreshToken = request.headers.authorization.replace('Bearer ', '')
        const { type, user: { id } } = jwt.verify(refreshToken, this.publicKey, { algorithms: ['RS256'] }) as TokenBasePayload
        if (type !== 'refresh_token') {
          return response.status(401).json({ message: 'Cannot use this token as refresh token' })
        }
        const user = await this.strategy.getUser(id)
        if(!user) {
          return response.status(403).json({ message: 'Cannot refresh this token' })
        }
        const accessToken = await this.generateAccessToken(user)
        return response.json({ accessToken })
      } catch (error) {
        return response.status(401).json({ message: 'Invalid token' })
      }
    }
  }

  can(actions: string[]) {
    return async (request: IRequest, response: IResponse, next: () => void) => {
      try {
        const accessToken = request.headers.authorization.replace('Bearer ', '')
        const { type, user: { id } } = jwt.verify(accessToken, this.publicKey, { algorithms: ['RS256'] }) as TokenBasePayload
        if (type !== 'access_token') {
          return response.status(401).json({ message: 'Cannot use this token as access token' })
        }

        const user = await this.strategy.getUser(id)

        if(!await this.strategy.can(actions, user)) {
          return response.status(403).json({ message: 'Cannot access required resource' })
        }

        request.user = user
        next()
      } catch (error) {
        console.log(error)
        return response.status(401).json({ message: 'Invalid token' })
      }
    }
  }
}