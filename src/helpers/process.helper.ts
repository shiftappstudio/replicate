export class ProcessTimer {
  private _startTime: any;
  private _diffTime: any;
  //   constructor() {
  //     this._startTime = process.hrtime();
  //   }
  public start(): void {
    this._startTime = process.hrtime();
  }
  public stop(): void {
    this._diffTime = process.hrtime(this._startTime);
  }

  public getTime(): number {
    const nanoseconds = this._diffTime[0] * 1e9 + this._diffTime[1];
    const seconds = nanoseconds / 1e9;
    return parseFloat(seconds.toFixed(2)); // Round to 2 decimal places
  }
}
