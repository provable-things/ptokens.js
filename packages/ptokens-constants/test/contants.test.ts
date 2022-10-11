import { ChainId, chainIdToTypeMap } from '../src/'

describe('chainIdToTypeMap', () => {
  test('Should map all ChainIds', () => {
    expect(Object.values(ChainId).every((_chainId) => chainIdToTypeMap.get(_chainId) !== undefined)).toBeTruthy()
  })
})
