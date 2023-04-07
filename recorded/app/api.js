import jsonwebtoken from 'jsonwebtoken'
import { once } from 'node:events'
import { createServer } from 'node:http'

const VALID = {
  user: 'erickwendel',
  password: '123'
}
const TOKEN_KEY = "abc123"

async function loginRoute(request, response) {
  const { user, password } = JSON.parse(await once(request, "data"))
  if (user !== VALID.user || password !== VALID.password) {
    response.writeHead(400)
    response.end(JSON.stringify({ error: 'user invalid!' }))
    return
  }

  const token = jsonwebtoken.sign({ user, message: 'heyduude' }, TOKEN_KEY)

  response.end(JSON.stringify({ token }))
}

function validateHeaders(headers) {
  try {
    const auth = headers.authorization.replace(/bearer\s/ig, '')
    jsonwebtoken.verify(auth, TOKEN_KEY)
    return true
  } catch (error) {
    return false
  }
}
async function createProductRoute(request, response) {
  const { description, price } = JSON.parse(await once(request, "data"))
    // se preço > 100 = premium
    // se preço > 50 && <= 100 = regular
    // se preço < 50 = basic
    const categories = {
      premium: {
        from: 101,
        to: 500
      },
      regular: {
        from: 51,
        to: 100
      },
      basic: {
        from: 0,
        to: 50
      },
    }
    const category = Object.keys(categories).find(key => {
      const category = categories[key]
      return price >= category.from && price <= category.to
    })
    response.end(JSON.stringify({ category }))
}

async function handler(request, response) {
  if (request.url === '/login' && request.method === "POST") {
    return loginRoute(request, response)
  }

  if (!validateHeaders(request.headers)) {
    response.writeHead(400)
    return response.end("invalid token!")
  }

  if (request.url == '/products' && request.method === "POST") {
    return createProductRoute(request, response)
  }

  response.writeHead(404)
  response.end('not found!')
}

const app = createServer(handler)
  .listen(3000, () => console.log('listening to 3000'))

export { app }