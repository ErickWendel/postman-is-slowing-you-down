import { describe, before, after, it } from 'node:test'
import { deepEqual, deepStrictEqual, ok } from 'node:assert'
const BASE_URL = `http://localhost:3000`
describe('API Products Test Suite', () => {
  let _server = {}
  let _globalToken = ''

  async function makeRequest(url, data) {
    const request = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        authorization: _globalToken
      }
    })
    deepEqual(request.status, 200)
    return request.json()
  }
  async function setToken() {
    const input = {
      user: 'erickwendel',
      password: '123'
    }

    const data = await makeRequest(`${BASE_URL}/login`, input)
    ok(data.token, 'token should be present')
    _globalToken = data.token
  }
  before(async () => {
    _server = (await import('./api.js')).app

    await new Promise(resolve => _server.once('listening', resolve))
  })
  before(async () => setToken())

  it('it should create a premium product', async () => {
    const input = {
      description: "pasta de dente",
      price: 101
    }
    const data = await makeRequest(`${BASE_URL}/products`, input)
    deepStrictEqual(data.category, "premium")
  
  })

  it('it should create a regular product', async () => {
    const input = {
      description: "escova de dente",
      price: 70
    }
    const data = await makeRequest(`${BASE_URL}/products`, input)
    deepStrictEqual(data.category, "regular")
  
  })

  it('it should create a basic product', async () => {
    const input = {
      description: "fio",
      price: 2
    }
    const data = await makeRequest(`${BASE_URL}/products`, input)
    deepStrictEqual(data.category, "basic")
  
  })
  after(done => _server.close(done))
})