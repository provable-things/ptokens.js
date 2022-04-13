export abstract class pTokensSwap {
  symbol: string

  constructor(symbol: string) {
    this.symbol = symbol
  }
  getSymbol(): string {
    return this.symbol
  }

  execute() {
    return 0
  }
}
