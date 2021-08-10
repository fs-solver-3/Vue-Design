/*
 * @author: tvc12 - Thien Vi
 * @created: 6/1/21, 5:30 PM
 */

import { Transition } from '@/shared/Bloc/Transition';

export abstract class BlocEventLog<Event, State> {
  abstract onTransition(transition: Transition<Event, State>): void;

  abstract onEvent(event: Event): void;
}
