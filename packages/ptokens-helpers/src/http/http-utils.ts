import fetch, { HeadersInit, Response } from 'node-fetch'
import { ERROR_JSON_RESPONSE_EXTRACTION } from '../errors'

export const postRequest = async (_url: string, _body: unknown, _headers: HeadersInit = {}, _timeout = 2000) => {
  console.debug(`Outgoing POST ${_url}`)
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, _timeout)
  try {
    const ret = await fetch(_url, {
      method: 'post',
      body: JSON.stringify(_body),
      headers: _headers,
      signal: controller.signal,
    })
    return ret
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timed out!')
    }
  } finally {
    clearTimeout(timeout)
  }
}

export const getRequest = async (_url: string, _headers = {}, _timeout = 2000) => {
  console.debug(`Outgoing GET ${_url}`)
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, _timeout)
  try {
    const ret = await fetch(_url, {
      headers: _headers,
      signal: controller.signal,
    })
    return ret
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timed out!')
    }
  } finally {
    clearTimeout(timeout)
  }
}

export const getJsonBody = async (_result: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await _result.json()
  } catch {
    throw new Error(ERROR_JSON_RESPONSE_EXTRACTION + JSON.stringify(_result))
  }
}
export const fetchJsonByGet = (_url: string, _headers = {}, _timeout = 50000): Promise<any> =>
  getRequest(_url, _headers, _timeout).then(getJsonBody)

export const fetchJsonByPost = (_url: string, _body, _headers = {}, _timeout = 500) =>
  postRequest(_url, _body, _headers, _timeout).then(getJsonBody)
