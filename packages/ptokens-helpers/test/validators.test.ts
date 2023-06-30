import { NetworkId } from 'ptokens-constants'

import { validators } from '../src/'

describe('chainIdToAddressValidatorMap', () => {
  test('Should get an address validator for every chain ID', () => {
    expect(
      Object.values(NetworkId).every(
        (_networkId) => validators.chainIdToAddressValidatorMap.get(_networkId) !== undefined
      )
    ).toBeTruthy()
  })
})

describe('isValidAddressByChainId', () => {
  interface AddressCheck {
    address: string
    expected: boolean
  }
  const evmAddresses: AddressCheck[] = [
    { address: '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF', expected: true },
    { address: '0xAff4d6793F584a473348EbA058deb8caad77a288', expected: true },
    { address: '0x52908400098527886E0F7030069857D2E4169EE7', expected: true },
    { address: '6xAff4d6793F584a473348EbA058deb8caad77a288', expected: false },
    { address: '0xff4d6793F584a473', expected: false },
    { address: 'aFf4d6793f584a473348ebA058deb8caad77a2885', expected: false },
  ]

  const addressesToCheck = new Map<NetworkId, { address: string; expected: boolean }[]>([
    [NetworkId.SepoliaTestnet, evmAddresses],
    [NetworkId.GoerliTestnet, evmAddresses],
    [NetworkId.ArbitrumMainnet, evmAddresses],
    [NetworkId.GnosisMainnet, evmAddresses],
  ])

  test('Should correctly check address validity', () => {
    expect(Object.values(NetworkId).every((_networkId) => addressesToCheck.get(_networkId) !== undefined)).toBeTruthy()
    Object.values(NetworkId).map((_networkId) =>
      addressesToCheck
        .get(_networkId)
        ?.map((_a) => expect(validators.isValidAddressByChainId(_a.address, _networkId)).toBe(_a.expected))
    )
  })
})
