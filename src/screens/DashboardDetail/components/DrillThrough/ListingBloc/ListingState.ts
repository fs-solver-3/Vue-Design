/*
 * @author: tvc12 - Thien Vi
 * @created: 7/19/21, 8:18 PM
 */

import { Dashboard, Directory } from '@core/domain';

export abstract class ListingState {}

export class ListingLoading extends ListingState {}

export class ListingLoaded extends ListingState {
  constructor(readonly data: any[]) {
    super();
  }
}

export class ListingError extends ListingState {
  constructor(readonly errorMsg: string) {
    super();
  }
}
