import { describe, before, after, it } from 'node:test'
import { deepStrictEqual, ok } from 'node:assert'
let _globalToken = ''
let BASE_URL = 'http://localhost:3000'

async function makeRequest(url, data) {
  const request = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'authorization': `${_globalToken}`
    },
  })

  deepStrictEqual(request.status, 200)
  return request.json()
}
async function setToken() {
  const input = {
    user: 'erickwendel',
    password: '123'
  }

  const data = await makeRequest(`${BASE_URL}/login`, input)
  ok(data.token, "token should be present")
  _globalToken = data.token
}


describe('API Workflow', () => {
  let _server = {}
  before(async () => {
    _server = (await import('./api.js')).app
    await new Promise(resolve => _server.once('listening', resolve))
  })

  before(async () => setToken())

  after(done => _server.close(done))

  it('it should create a premium product', async () => {
    const input = {
      name: 'macbook',
      price: 100,
      description: 'a super pc!'
    }
    const data = await makeRequest(`${BASE_URL}/products`, input)
    deepStrictEqual(data.category, "premium")
  })

  it('it should create a regular product', async () => {
    const input = {
      name: 'macbook',
      price: 55,
      description: 'a super pc!'
    }
    const data = await makeRequest(`${BASE_URL}/products`, input)
    deepStrictEqual(data.category, "regular")
  })

  it('it should create a basic product', async () => {
    const input = {
      name: 'macbook',
      price: 10,
      description: 'a super pc!'
    }
    const data = await makeRequest(`${BASE_URL}/products`, input)
    deepStrictEqual(data.category, "basic")
  })
})