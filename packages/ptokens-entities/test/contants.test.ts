import { ChainId, chainIdToBlockchain, chainIdToTypeMap } from '../src/constants'

describe('chainIdToBlockchain', () => {
  test('Should get correct blockchain and network', () => {
    expect(
      Object.values(ChainId).every((_chainId) =>
        Object.values(chainIdToBlockchain.get(_chainId)).every((_val) => _val !== undefined)
      )
    ).toBeTruthy()
  })
})

describe('chainIdToTypeMap', () => {
  test('Should map all ChainIds', () => {
    expect(Object.values(ChainId).every((_chainId) => chainIdToTypeMap.get(_chainId) !== undefined)).toBeTruthy()
  })
})
