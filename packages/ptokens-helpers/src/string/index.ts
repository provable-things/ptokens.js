const HEX_PREFIX = '0x'
export const zeroEther = HEX_PREFIX + '00'
export const zeroAddress = HEX_PREFIX + '0000000000000000000000000000000000000000'

export function isHexPrefixed(_string: string) {
  return _string.slice(0, 2).toLocaleLowerCase() === HEX_PREFIX
}

export function addHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string : HEX_PREFIX + _string
}

export function removeHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string.substring(2) : _string
}

export function hexStringToBuffer(_string: string) {
  return Buffer.from(removeHexPrefix(_string), 'hex')
}

export function splitCamelCase(str: string): string[] {
  return str.split(/(?=[A-Z])/)
}
