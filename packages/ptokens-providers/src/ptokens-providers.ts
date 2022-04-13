export abstract class pTokensProvider {
  symbol: string

  constructor(symbol: string) {
    this.symbol = symbol
  }
  getSymbol(): string {
    return this.symbol
  }
}
