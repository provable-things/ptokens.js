import BigNumber from 'bignumber.js'

/**
 * Get the amount string with correct symbol precision and symbol
 * @param _amount - The amount to be formatted.
 * @param _decimals - The token decimals.
 * @param symbol - The token symbol.
 * @returns The formatted amount string.
 * @example
 * getAmountInEosFormat('111.44443399', 6, 'SYS')
 * // '111.444434 SYS'
 */
export const getAmountInEosFormat = (_amount: BigNumber | number | string, _decimals: number, symbol: string) => {
  return `${new BigNumber(_amount).toFixed(_decimals)} ${symbol.toUpperCase()}`
}
