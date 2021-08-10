import { SubActivity, Event, UserDetail } from '@core/domain/Response';

export interface ActivityGroup {
  key: string;
  value: ActivityGroupInfo[];
}

export interface ActivityGroupInfo {
  id: number;
  eventId: string;
  eventName: string;
  title: string;
  time: string;
  username: string;
  event: Event;
  subActivities: SubActivity;
  userDetail: UserDetail;
}
