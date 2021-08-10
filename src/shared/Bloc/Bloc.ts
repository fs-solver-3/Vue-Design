/*
 * @author: tvc12 - Thien Vi
 * @created: 5/31/21, 4:35 PM
 */

import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { ListenerData } from '@/shared/Bloc/ListenerData';
import { BaseBloc } from '@/shared/Bloc/BaseBloc';
import { BlocLogger } from '@/shared/Bloc/BlocLogger';
import { Transition } from '@/shared/Bloc/Transition';
import { BlocEventLog } from '@/shared/Bloc/BlocEventLog';
import { Equatable } from '@core/domain';

export type NextFunction<Event, State> = (value: Event) => Observable<Transition<Event, State>>;

export abstract class Bloc<Event, State> extends BaseBloc<Event, State> implements BlocEventLog<Event, State> {
  protected readonly eventBus: Subject<Event>;
  protected readonly stateBus: Subject<State>;
  protected stateSubscription: Subscription = Subscription.EMPTY;
  protected transitionSubscription: Subscription = Subscription.EMPTY;
  protected readonly listenersAsMap: Map<string, ListenerData<State>>;
  protected isEmitted = false;

  protected constructor(public state: State, protected readonly blocLogger?: BlocLogger<Event, State>) {
    super();
    this.eventBus = new Subject<Event>();
    this.stateBus = new Subject<State>();
    this.listenersAsMap = new Map<string, ListenerData<State>>();
    this.init();
  }

  add(event: Event): void {
    if (this.eventBus.isStopped) {
      throw new Error('Event bus closed');
    }
    this.onEvent(event);
    this.eventBus.next(event);
  }

  addListener(data: ListenerData<State>): void {
    this.blocLogger?.log('-----------------Bloc addListener:start------------------');
    this.blocLogger?.log('Key', data.key);
    this.listenersAsMap.set(data.key, data);
    this.blocLogger?.log('-----------------Bloc addListener:done------------------');
  }

  removeListener(key: string) {
    this.blocLogger?.log('-----------------Bloc removeListener:start------------------');
    this.blocLogger?.log('key', key);
    this.listenersAsMap.delete(key);
    this.blocLogger?.log('-----------------Bloc removeListener:done------------------');
  }

  dispose() {
    this.blocLogger?.log('-----------------Bloc dispose:start------------------');
    this.stateBus.complete();
    this.eventBus.complete();
    this.stateSubscription.unsubscribe();
    this.transitionSubscription.unsubscribe();
    this.blocLogger?.log('-----------------Bloc dispose:done------------------');
  }

  /**
   * Transforms the events along with a `NextFunction` into
   * an `Observable<Transition>`.
   * Events that should be processed by `mapEventToState` need to be passed to
   * the `next`.
   * By default `concatMap` is used to ensure all events are processed in
   * the order in which they are received.
   * You can override `transformEvents` for advanced usage in order to
   * manipulate the frequency and specificity with which `mapEventToState` is
   * called as well as which `events` are processed.
   *
   * @param {Observable<Event>} eventBus
   * @param {NextFunction<Event, State>} next
   * @return {*}  {Observable<Transition<Event, State>>}
   * @memberOf Bloc
   */
  transformEvents(eventBus: Observable<Event>, next: NextFunction<Event, State>): Observable<Transition<Event, State>> {
    return eventBus.pipe(concatMap(next));
  }

  /**
   * Transforms the `Observable<Transition>` into a new `Observable<Transition>`.
   * By default `transformTransitions` returns the incoming `Observable<Transition>`.
   * You can override `transformTransitions` for advanced usage in order to
   * manipulate the frequency and specificity at which `transitions`
   * (state changes) occur.
   *
   * @param {Observable<Transition<Event, State>>} transitionBus
   * @return {*}  {Observable<Transition<Event, State>>}
   * @memberOf Bloc
   */
  transformTransitions(transitionBus: Observable<Transition<Event, State>>): Observable<Transition<Event, State>> {
    return transitionBus;
  }

  onTransition(transition: Transition<Event, State>): void {
    this.blocLogger?.logTransition(transition);
  }

  onEvent(event: Event): void {
    this.blocLogger?.logEvent(event);
  }

  protected init(): void {
    this.bindStateSubject();
    this.initSubscription();
  }

  protected abstract mapEventToState(event: Event): AsyncIterableIterator<State>;

  protected asyncToObservable<T>(iterable: AsyncIterableIterator<T>): Observable<T> {
    return new Observable<T>(
      observer =>
        void (async () => {
          try {
            for await (const item of iterable) {
              if (observer.closed) return;
              observer.next(item);
            }
            observer.complete();
          } catch (e) {
            observer.error(e);
          }
        })()
    );
  }

  /**
   * Check two state is same instance, if false state will emit to listener
   * @param currentState
   * @param nextState
   * @protected
   */
  protected isSameState(currentState: State, nextState: State): boolean {
    if (Equatable.isEquatable(currentState)) {
      return currentState.equals(nextState);
    } else if (Equatable.isEquatable(nextState)) {
      return nextState.equals(currentState);
    } else {
      return currentState === nextState;
    }
  }

  private onEventChanged(event: Event): Observable<Transition<Event, State>> {
    const listState: AsyncIterableIterator<State> = this.mapEventToState(event);
    return this.asyncToObservable(listState).pipe(
      map((nextState: State) => new Transition(this.state, event, nextState)),
      catchError(error => {
        this.onError(error);
        return EMPTY;
      })
    );
  }

  private onError(error: any): void {
    this.blocLogger?.log('--------------Bloc error start-------------------');
    this.blocLogger?.log(error);
    this.blocLogger?.log('--------------Bloc error end-------------------');
  }

  private onStateChange(state: State): void {
    this.listenersAsMap.forEach((listener: ListenerData<State>) => {
      listener.onStateChange(state);
    });
  }

  private bindStateSubject(): void {
    const transitionBus: Observable<Transition<Event, State>> = this.transformEvents(this.eventBus, event => this.onEventChanged(event));
    this.transitionSubscription = this.transformTransitions(transitionBus).subscribe(transition => this.onTransitionChanged(transition));
  }

  private onTransitionChanged(transition: Transition<Event, State>) {
    if (this.isSameState(transition.currentState, transition.nextState) && this.isEmitted) return;
    try {
      this.onTransition(transition);
      this.state = transition.nextState;
      this.stateBus.next(transition.nextState);
    } catch (error) {
      this.onError(error);
    }
    this.isEmitted = true;
  }

  private initSubscription() {
    this.stateSubscription = this.stateBus.subscribe(state => this.onStateChange(state));
  }
}
