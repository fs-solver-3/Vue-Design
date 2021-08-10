/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 4:50 PM
 */

export class Transition<Event, State> {
  constructor(public currentState: State, public event: Event, public nextState: State) {}
}
