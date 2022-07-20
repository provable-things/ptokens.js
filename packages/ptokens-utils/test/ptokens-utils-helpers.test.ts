import { parseParams, getNetworkType, addHexPrefix, removeHexPrefix, isHexPrefixed } from '../src/helpers'

test('Should return the same 0x prefixed string', () => {
  const string0xPrefixed = '0xhello'
  const expectedString0xPrefixed = '0xhello'
  const result = addHexPrefix(string0xPrefixed)
  expect(result).toStrictEqual(expectedString0xPrefixed)
})

test('Should return the 0x prefixed string', () => {
  const stringNot0xPrefixed = 'hello'
  const expectedString0xPrefixed = '0xhello'
  const result = addHexPrefix(stringNot0xPrefixed)
  expect(result).toStrictEqual(expectedString0xPrefixed)
})

test('Should remove the 0x prefix', () => {
  const string0xPrefixed = '0xhello'
  const expectedStringnnNot0xPrefixed = 'hello'
  const result = removeHexPrefix(string0xPrefixed)
  expect(result).toStrictEqual(expectedStringnnNot0xPrefixed)
})

test('Should return the same string if 0x prefix is missing', () => {
  const string0xPrefixed = 'hello'
  const expectedStringnnNot0xPrefixed = 'hello'
  const result = removeHexPrefix(string0xPrefixed)
  expect(result).toStrictEqual(expectedStringnnNot0xPrefixed)
})

test('Should return true since 0xhello is 0x prefixed', () => {
  const string0xPrefixed = '0xhello'
  const result = isHexPrefixed(string0xPrefixed)
  expect(result).toBe(true)
})

test('Should return false since hello is not 0x prefixed', () => {
  const string0xNotPrefixed = 'hello0x'
  const result = isHexPrefixed(string0xNotPrefixed)
  expect(result).toBe(false)
})

test('Should generate an error because it is not possible to initialize with both blockchain and hostBlockchain', () => {
  const expectedErrorMessage = 'Bad initialization'

  try {
    parseParams(
      {
        blockchain: 'ETH',
        hostBlockchain: 'ETH',
        network: 'testnet',
      },
      'bitcoin'
    )
  } catch (err) {
    expect(err.message).toStrictEqual(expectedErrorMessage)
  }
})

test('Should generate an error because it is not possible to use both network and hostNetwork', () => {
  const expectedErrorMessage = 'Bad initialization'

  try {
    parseParams(
      {
        blockchain: 'ETH',
        network: 'testnet',
        hostNetwork: 'testnet_ropsten',
      },
      'bitcoin'
    )
  } catch (err) {
    expect(err.message).toStrictEqual(expectedErrorMessage)
  }
})

test('Should parse with native blockchain = Bitcoin Testnet and host blockchain = Ethereum Ropsten', () => {
  const expectedHostBlockchain = 'ethereum'
  const expectedHostNetwork = 'testnet_ropsten'
  const expectedNativeBlockchain = 'bitcoin'
  const expectedNativeNetwork = 'testnet'

  const parsed = parseParams(
    {
      blockchain: 'ETH',
      network: 'testnet',
    },
    'bitcoin'
  )

  expect(parsed.hostBlockchain).toStrictEqual(expectedHostBlockchain)
  expect(parsed.hostNetwork).toStrictEqual(expectedHostNetwork)
  expect(parsed.nativeBlockchain).toStrictEqual(expectedNativeBlockchain)
  expect(parsed.nativeNetwork).toStrictEqual(expectedNativeNetwork)
})

test('Should parse with native blockchain = Bitcoin Testnet and host blockchain = EOS Jungle3', () => {
  const expectedHostBlockchain = 'eosio'
  const expectedHostNetwork = 'testnet_jungle3'
  const expectedNativeBlockchain = 'bitcoin'
  const expectedNativeNetwork = 'testnet'

  const parsed = parseParams(
    {
      blockchain: 'EOS',
      network: 'testnet',
    },
    'bitcoin'
  )

  expect(parsed.hostBlockchain).toStrictEqual(expectedHostBlockchain)
  expect(parsed.hostNetwork).toStrictEqual(expectedHostNetwork)
  expect(parsed.nativeBlockchain).toStrictEqual(expectedNativeBlockchain)
  expect(parsed.nativeNetwork).toStrictEqual(expectedNativeNetwork)
})

test('Should parse with native blockchain = Bitcoin Testnet and host blockchain = EOS Jungle3 specifyng hostBlockchain and hostNetwork', () => {
  const expectedHostBlockchain = 'eosio'
  const expectedHostNetwork = 'testnet_jungle3'
  const expectedNativeBlockchain = 'bitcoin'
  const expectedNativeNetwork = 'testnet'

  const parsed = parseParams(
    {
      hostBlockchain: 'EOS',
      hostNetwork: 'testnet_jungle3',
    },
    'bitcoin'
  )

  expect(parsed.hostBlockchain).toStrictEqual(expectedHostBlockchain)
  expect(parsed.hostNetwork).toStrictEqual(expectedHostNetwork)
  expect(parsed.nativeBlockchain).toStrictEqual(expectedNativeBlockchain)
  expect(parsed.nativeNetwork).toStrictEqual(expectedNativeNetwork)
})

test('Should parse with native blockchain = Bitcoin Mainnet and host blockchain = Ethereum Mainnet', () => {
  const expectedHostBlockchain = 'ethereum'
  const expectedHostNetwork = 'mainnet'
  const expectedNativeBlockchain = 'bitcoin'
  const expectedNativeNetwork = 'mainnet'

  const parsed = parseParams(
    {
      blockchain: 'ETH',
      network: 'mainnet',
    },
    'bitcoin'
  )

  expect(parsed.hostBlockchain).toStrictEqual(expectedHostBlockchain)
  expect(parsed.hostNetwork).toStrictEqual(expectedHostNetwork)
  expect(parsed.nativeBlockchain).toStrictEqual(expectedNativeBlockchain)
  expect(parsed.nativeNetwork).toStrictEqual(expectedNativeNetwork)
})

test('Should be (testnet_ropsten) a Testnet network', () => {
  const expectedNetworkType = 'testnet'
  const type = getNetworkType('testnet_ropsten')
  expect(type).toStrictEqual(expectedNetworkType)
})

test('Should be (testnet_jungle3) a Testnet network', () => {
  const expectedNetworkType = 'testnet'
  const type = getNetworkType('testnet_jungle3')
  expect(type).toStrictEqual(expectedNetworkType)
})
