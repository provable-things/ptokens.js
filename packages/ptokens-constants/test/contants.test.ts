import { NetworkId, networkIdToTypeMap } from '../src/'

describe('networkIdToTypeMap', () => {
  test('Should map all ChainIds', () => {
    expect(
      Object.values(NetworkId).every((_networkId) => networkIdToTypeMap.get(_networkId) !== undefined)
    ).toBeTruthy()
  })
})
