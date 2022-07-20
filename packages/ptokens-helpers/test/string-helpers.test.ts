import { stringUtils } from '../src/'

test('Should return the same 0x prefixed string', () => {
  const string0xPrefixed = '0xhello'
  const expectedString0xPrefixed = '0xhello'
  const result = stringUtils.addHexPrefix(string0xPrefixed)
  expect(result).toStrictEqual(expectedString0xPrefixed)
})

test('Should return the 0x prefixed string', () => {
  const stringNot0xPrefixed = 'hello'
  const expectedString0xPrefixed = '0xhello'
  const result = stringUtils.addHexPrefix(stringNot0xPrefixed)
  expect(result).toStrictEqual(expectedString0xPrefixed)
})

test('Should remove the 0x prefix', () => {
  const string0xPrefixed = '0xhello'
  const expectedStringnnNot0xPrefixed = 'hello'
  const result = stringUtils.removeHexPrefix(string0xPrefixed)
  expect(result).toStrictEqual(expectedStringnnNot0xPrefixed)
})

test('Should return the same string if 0x prefix is missing', () => {
  const string0xPrefixed = 'hello'
  const expectedStringnnNot0xPrefixed = 'hello'
  const result = stringUtils.removeHexPrefix(string0xPrefixed)
  expect(result).toStrictEqual(expectedStringnnNot0xPrefixed)
})

test('Should return true since 0xhello is 0x prefixed', () => {
  const string0xPrefixed = '0xhello'
  const result = stringUtils.isHexPrefixed(string0xPrefixed)
  expect(result).toBe(true)
})

test('Should return false since hello is not 0x prefixed', () => {
  const string0xNotPrefixed = 'hello0x'
  const result = stringUtils.isHexPrefixed(string0xNotPrefixed)
  expect(result).toBe(false)
})
