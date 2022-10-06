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

test('Should return true since 0XC0FFEE is 0x prefixed', () => {
  const string0xPrefixed = '0XC0FFEE'
  const result = stringUtils.isHexPrefixed(string0xPrefixed)
  expect(result).toBe(true)
})

test('Should return false since hello is not 0x prefixed', () => {
  const string0xNotPrefixed = 'hello0x'
  const result = stringUtils.isHexPrefixed(string0xNotPrefixed)
  expect(result).toBe(false)
})

test('Should return a buffer from hex string', () => {
  const hexString = '0xc0ffee'
  const result = stringUtils.hexStringToBuffer(hexString)
  expect(result).toStrictEqual(Buffer.from([0xc0, 0xff, 0xee]))
})

describe('splitCamelCase', () => {
  test('Should correctly split camelCase string', () => {
    const str = 'helloHowAreYou'
    const result = stringUtils.splitCamelCase(str)
    expect(result).toStrictEqual(['hello', 'How', 'Are', 'You'])
  })

  test('Should correctly split mixed string', () => {
    const str = 'hello_howAreYou'
    const result = stringUtils.splitCamelCase(str)
    expect(result).toStrictEqual(['hello_how', 'Are', 'You'])
  })

  test('Should not split snake case', () => {
    const str = 'hello_how_are_you'
    const result = stringUtils.splitCamelCase(str)
    expect(result).toStrictEqual(['hello_how_are_you'])
  })
})
