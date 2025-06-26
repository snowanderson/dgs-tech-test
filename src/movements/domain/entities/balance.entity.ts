export class Balance {
  constructor(
    private readonly date: Date,
    private readonly amount: number,
  ) {}

  getDate(): Date {
    return this.date;
  }

  getAmount(): number {
    return this.amount;
  }
}
