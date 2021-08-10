/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 5:29 PM
 */

import { BlocLogger } from '@/shared/Bloc/BlocLogger';
import { Log } from '@core/utils';
import { Transition } from '@/shared/Bloc/Transition';

export class DefaultBlocLogger implements BlocLogger<any, any> {
  logEvent(event: any): void {
    Log.debug('\n------------------- Log Event ::start----------------------');
    Log.debug('\nDefaultBlocLogger::event', event.toString());
    Log.debug('\n------------------- Log Event ::End----------------------');
  }

  logTransition(transition: Transition<any, any>): void {
    Log.debug('\n------------------- Log Transition ::start----------------------');
    Log.debug('\nDefaultBlocLogger::logTransition', transition.currentState.toString());
    Log.debug('\n------------------- Log Transition ::end----------------------');
  }

  log(...data: any): void {
    Log.debug(...data);
  }
}
