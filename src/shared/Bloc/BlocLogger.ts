/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 5:28 PM
 */

import { Transition } from '@/shared/Bloc/Transition';

export abstract class BlocLogger<Event, State> {
  abstract logEvent(event: Event): void;

  abstract logTransition(transition: Transition<Event, State>): void;

  abstract log(...data: any): void;
}
