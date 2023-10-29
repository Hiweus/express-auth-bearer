# Auth express handler

Expose functions to handle access/refresh token and authorization

## Basic usage

```js
import 'dotenv/config.js'

import express from "express"
import { Auth } from '@hiweus/express-auth-bearer'

const app = express()
app.use(express.json())

const strategy = {
  async login({ email, password }) {
    if(password !== 'cole') {
      return null
    }
    return {
      id: 1,
    }
  },

  async getUser(id) {
    return {
      id: +id,
      email: 'admin@admin.com',
      permissions: [
        'read:users',
        'read:posts',
      ]
    }
  },

  async can(actions, user) {
    return actions.every(action => user.permissions.includes(action))
  },
}

const auth = new Auth({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  strategy,
})

app.get('/', 
auth.can(['read:users', 'read:posts']),
(req, res) => {
  res.send("Hello World")
})

app.post('/login', auth.login())
app.post('/refresh', auth.refresh())

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
```