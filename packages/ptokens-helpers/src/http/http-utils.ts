import fetch, { HeadersInit, Response } from 'node-fetch'
import { ERROR_JSON_RESPONSE_EXTRACTION } from '../errors'

export async function postRequest(_url: string, _body, _headers: HeadersInit | undefined = {}, _timeout = 2000) {
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

export async function getRequest(_url: string, _headers: HeadersInit | undefined = {}, _timeout = 2000) {
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

export async function getJsonBody<T>(_result: Response): Promise<T> {
  try {
    return (await _result.json()) as T
  } catch {
    throw new Error(ERROR_JSON_RESPONSE_EXTRACTION + JSON.stringify(_result))
  }
}
export async function fetchJsonByGet<T>(
  _url: string,
  _headers: HeadersInit | undefined = {},
  _timeout = 50000
): Promise<T> {
  const resp = await getRequest(_url, _headers, _timeout)
  return await getJsonBody<T>(resp)
}

export async function fetchJsonByPost<T>(
  _url: string,
  _body,
  _headers: HeadersInit | undefined = {},
  _timeout = 500
): Promise<T> {
  const resp = await postRequest(_url, _body, _headers, _timeout)
  return await getJsonBody<T>(resp)
}
