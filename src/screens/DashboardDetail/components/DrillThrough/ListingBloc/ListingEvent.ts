/*
 * @author: tvc12 - Thien Vi
 * @created: 7/19/21, 8:18 PM
 */

export abstract class ListingEvent {}

export class SearchDashboard extends ListingEvent {
  constructor(readonly keyword: string) {
    super();
  }
}

export class LoadMoreDashboard extends ListingEvent {
  constructor() {
    super();
  }
}

export class ReloadDashboard extends ListingEvent {}
