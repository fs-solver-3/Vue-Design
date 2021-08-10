import { UserAdminService } from '@core/admin/service/UserAdminService';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { Stores } from '@/shared';
import { Inject } from 'typescript-ioc';
import { UserProfileTableRow } from '@/shared/interfaces/user_profile_table.interface';
import moment from 'moment';
import { CreateUserRequest } from '@core/admin/domain/request/CreateUserRequest';
import { UserGenders, UserProfile } from '@core/domain/Model';
import { PROFILE_LISTING_HEADERS } from '@/screens/user_management/store/enum';
import { PopupUtils } from '@/utils/popup.utils';
import { RegisterResponse } from '@core/domain/Response';
import { UserSearchResponse } from '@core/domain/Response/User/UserSearchResponse';

export interface UserProfileListingState {
  userProfileTableRows: UserProfileTableRow[];
  from: number;
  size: number;
  totalProfile: number;
}

@Module({ namespaced: true, store: store, dynamic: true, name: Stores.userProfileListingStore })
class UserProfileListingStore extends VuexModule {
  from: UserProfileListingState['from'] = 0;
  size: UserProfileListingState['size'] = 0;
  userProfileTableRows: UserProfileListingState['userProfileTableRows'] = [];
  totalProfile: UserProfileListingState['totalProfile'] = 0;

  @Inject
  private userManagementService!: UserAdminService;

  get headerInfos() {
    return PROFILE_LISTING_HEADERS;
  }

  @Action({ rawError: true })
  loadUserProfileListing(): Promise<void> {
    return this.userManagementService.searchV2(this.from, this.size, undefined).then(resp => {
      if (resp) {
        this.setUserSearchData({ data: resp.data, total: resp.total });
      }
    });
  }

  @Mutation
  setUserSearchData(userResponse: UserSearchResponse) {
    this.totalProfile = userResponse.total;
    this.userProfileTableRows = UserProfileListingStore.toUserProfileTableRows(userResponse);
  }

  @Action({ rawError: true })
  createUser(createUserRequest: CreateUserRequest): Promise<RegisterResponse> {
    return this.userManagementService.create(createUserRequest);
  }

  @Mutation
  setFromAndSize(payload: { from: number; size: number }) {
    this.from = payload.from;
    this.size = payload.size;
  }

  @Mutation
  setFrom(payload: { from: number }) {
    this.from = payload.from;
  }

  @Mutation
  reset() {
    this.userProfileTableRows = [];
  }

  static toUserProfileTableRows(userResponse: UserSearchResponse): UserProfileTableRow[] {
    const dateFormatStyle = 'MMM, DD YYYY HH:mm:ss';
    const dateFormatStyle2 = 'MMM, DD YYYY';
    return userResponse.data.map(userFullDetail => {
      const user = userFullDetail.user;
      const userProfile = userFullDetail.profile ?? UserProfile.fromObject({});
      return {
        0: user.username, //key of row
        username: user.username,
        fullName: userProfile.fullName,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        mobilePhone: userProfile.mobilePhone,
        gender: UserGenders.toDisplayName(userProfile.gender ?? UserGenders.Other),
        dob: userProfile.dob ? moment(userProfile.dob).format(dateFormatStyle2) : '',
        avatar: userProfile.avatar,
        updatedTime: userProfile.createdTime ? moment(userProfile.updatedTime).format(dateFormatStyle) : '',
        createdTime: userProfile.createdTime ? moment(userProfile.createdTime).format(dateFormatStyle) : '',
        isActive: user.isActive ? 'Active' : 'Suspended'
      } as UserProfileTableRow;
    });
  }
}

export const UserProfileListingModule = getModule(UserProfileListingStore);
