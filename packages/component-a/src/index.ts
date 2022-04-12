export class Name {
  first_name: string
  last_name: string

  constructor(fname: string, lname: string) {
    this.first_name = fname
    this.last_name = lname
  }
  getName(): string {
    const fullname: string = this.first_name + ' ' + this.last_name
    return fullname
  }
}
