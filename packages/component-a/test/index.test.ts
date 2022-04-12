import { Name } from '../src/index'

describe('Component A', () => {
  it('Name class', () => {
    const a = new Name('alain', 'olivier')
    const name = a.getName()
    expect(name).toStrictEqual('alain olivier')
  })
})
