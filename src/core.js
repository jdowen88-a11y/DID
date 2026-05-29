export class ElementalCore {
  constructor() {
    this.state = { focus: "ether", tickCount: 0 };
  }

  reset() {
    this.state = { focus: "ether", tickCount: 0 };
    return this.status();
  }

  status() {
    return this.state;
  }

  scan() {
    return this.state;
  }

  tick(input = "") {
    this.state.tickCount += 1;
    return { ...this.state, input, spoken: { text: input } };
  }

  setFocus(loop = "ether") {
    this.state.focus = loop;
    return this.scan();
  }
}
