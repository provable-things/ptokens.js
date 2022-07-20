const HEX_PREFIX = '0x'
export const zeroEther = HEX_PREFIX + '00'
export const zeroAddress = HEX_PREFIX + '0000000000000000000000000000000000000000'

export function isHexPrefixed(_string: string) {
  return _string.slice(0, 2) === HEX_PREFIX
}

export function addHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string : HEX_PREFIX + _string
}

export function removeHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string.substring(2) : _string
}
