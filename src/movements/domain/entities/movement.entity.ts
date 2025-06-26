export class Movement {
  constructor(
    private readonly id: number,
    private readonly date: Date,
    private readonly wording: string,
    private readonly amount: number,
  ) {}

  getId(): number {
    return this.id;
  }

  getDate(): Date {
    return this.date;
  }

  getAmount(): number {
    return this.amount;
  }

  getWording(): string {
    return this.wording;
  }
}
