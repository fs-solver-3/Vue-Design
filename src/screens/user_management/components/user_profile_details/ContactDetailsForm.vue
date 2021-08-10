<template>
  <vuescroll :ops="configOps" class="scroll-area" :class="{ blockScroll: isClickGender }">
    <div class="profile-details-form">
      <EditableColumnFormInput
        :item="fixedColumn[0]"
        :backgroundColor="currentTheme.userProfileBackgroundColor"
        :inputBackgroundColor="currentTheme.primary"
        @editableFormInputSaved="handleUpdateContactInfo"
        :maxSpanWidth="maxSpanWidth"
      />
      <div class="email profile-field-item text-left">
        <label>Email</label>
        <div class="value">{{ userFullDetailInfo.profile.email }}</div>
      </div>
      <EditableColumnFormInput
        :item="fixedColumn[2]"
        :backgroundColor="currentTheme.userProfileBackgroundColor"
        :inputBackgroundColor="currentTheme.primary"
        @editableFormInputSaved="handleUpdateContactInfo"
        :maxSpanWidth="maxSpanWidth"
      />

      <EditableColumnFormInput
        :item="fixedColumn[3]"
        :backgroundColor="currentTheme.userProfileBackgroundColor"
        :inputBackgroundColor="currentTheme.primary"
        @editableFormInputSaved="handleUpdateContactInfo"
        :maxSpanWidth="maxSpanWidth"
      />

      <div class="gender profile-field-item text-left">
        <label>Gender</label>
        <DiDropdown
          :id="genDropdownId('user-profile-gender')"
          :appendAtRoot="true"
          :data="genderData"
          class="swm-select"
          v-model="currentGender"
          value-props="value"
        />
      </div>
      <div class="date-of-birth profile-field-item text-left">
        <label>Date of Birth</label>
        <DatePicker
          :popover="{ visibility: 'click', positionFixed: true }"
          mode="single"
          color="blue"
          isDark
          :masks="{ input: ['MMM D, YYYY'] }"
          :attributes="attrs"
          title-position="left"
          :wpositionFixed="true"
          :updateOnInput="false"
          v-model="dob"
          @input="handleChangeDateOfBirth"
          class="date-picker"
        >
        </DatePicker>
      </div>
      <EditableColumnFormInput
        :item="fixedColumn[4]"
        :backgroundColor="currentTheme.userProfileBackgroundColor"
        :inputBackgroundColor="currentTheme.primary"
        @editableFormInputSaved="handleUpdateContactInfo"
        :maxSpanWidth="maxSpanWidth"
      />

      <EditableColumnFormInput
        :item="fixedColumn[7]"
        :backgroundColor="currentTheme.userProfileBackgroundColor"
        :inputBackgroundColor="currentTheme.primary"
        @editableFormInputSaved="handleUpdateContactInfo"
        :maxSpanWidth="maxSpanWidth"
      />

      <div v-for="(item, index) in dynamicColumns" :key="index">
        <EditableColumnFormInput
          :item="item"
          :backgroundColor="currentTheme.userProfileBackgroundColor"
          :inputBackgroundColor="currentTheme.primary"
          @editableFormInputSaved="handleUpdateExtraInfo"
          :maxSpanWidth="maxSpanWidth"
          class="properties"
        />
      </div>

      <!--      </template>-->
    </div>
  </vuescroll>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import vuescroll, { Config } from 'vuescroll';
import { ThemeModule } from '@/store/modules/theme.store';
import { DataInsiderTheme } from '@/themes/theme';
import { ScrollConfigs } from '@/shared';
import EditableColumnFormInput from '@/shared/components/EditableColumnFormInput.vue';
import { GenericColumn } from '@core/domain/Model/Column/Implement/GenericColumn';
import { EditableColumn } from '@core/domain/Model/Column/Implement/EditableColumn';
import { StringUtils } from '@/utils/string.utils';
import { UserProfileDetailModule } from '@/screens/user_management/store/user_profile_detail.store';
import { UserGenders } from '@core/domain/Model';
// @ts-ignore
import DatePicker from 'v-calendar/lib/components/date-picker.umd';
import moment from 'moment';
import { EditUserProfileRequest } from '@core/admin/domain/request/EditUserProfileRequest';
import { PopupUtils } from '@/utils/popup.utils';
import { Log } from '@core/utils';

@Component({
  components: {
    EditableColumnFormInput,
    vuescroll,
    DatePicker
  },
  computed: {}
})
export default class ContactDetailsForm extends Vue {
  private currentGender!: number | undefined;
  private dob!: Date | null;
  private modelDate!: Date | undefined;
  attrs: Array<object> = [
    {
      key: 'today',
      bar: 'blue',
      popover: {
        label: "You just hovered over today's date!"
      },
      dates: new Date()
    }
  ];

  @Prop({ type: Number })
  maxSpanWidth!: number;

  isClickGender = false;

  constructor() {
    super();
    this.currentGender = this.userFullDetailInfo?.profile?.gender;
    this.dob = this.userFullDetailInfo?.profile?.dob ? moment(this.userFullDetailInfo?.profile?.dob).toDate() : null;
    // this.modelDate = this.dob;
  }

  //todo resolve lock scroll
  private configOps: Config = ScrollConfigs;

  // private get dateOfBirth() {
  //   return  this.userFullDetailInfo?.profile?.dob? moment(this.userFullDetailInfo?.profile?.dob).toDate() : '---';
  // }
  //
  // private set dateOfBirth(date: Date) {
  //   this.dob = date;
  // }

  private get genderData() {
    return UserGenders.allGenders().map(genderItem => {
      return {
        label: genderItem[0],
        value: genderItem[1]
      };
    });
  }

  private get userFullDetailInfo() {
    return UserProfileDetailModule.userFullDetailInfo;
  }

  private get fixedColumn(): EditableColumn[] {
    const result: EditableColumn[] = [];

    // get EditableColumn at profile
    this.columns.forEach(col => {
      const value = (this.userFullDetailInfo?.profile as any)[col.name];
      Log.debug(this.userFullDetailInfo?.profile);
      Log.debug('value::', value, col.name);
      result.push(new EditableColumn(col, value));
    });
    return result;
  }

  private get dynamicColumns(): EditableColumn[] {
    const result: EditableColumn[] = [];
    // get EditableColumn at profile.properties
    this.propertiesColumns.map(col => {
      const value = (this.userFullDetailInfo?.profile?.properties as any)[col.name];
      result.push(new EditableColumn(col, value));
    });

    return result;
  }

  //todo build profile -> generic column[]
  get columns(): GenericColumn[] {
    const result = [
      new GenericColumn({
        displayName: 'Name',
        name: 'fullName',
        dataType: 'string',
        className: ''
      }),
      new GenericColumn({
        displayName: 'Email',
        name: 'email',
        dataType: 'string',
        className: ''
      }),
      new GenericColumn({
        displayName: 'First Name',
        name: 'firstName',
        dataType: 'string',
        className: ''
      }),
      new GenericColumn({
        displayName: 'Last Name',
        name: 'lastName',
        dataType: 'string',
        className: ''
      }),
      new GenericColumn({
        displayName: 'Mobile Phone',
        name: 'mobilePhone',
        dataType: 'string',
        className: ''
      }),
      new GenericColumn({
        displayName: 'Gender',
        name: 'gender',
        dataType: 'number',
        className: ''
      }),

      new GenericColumn({
        displayName: 'Date of Birth',
        name: 'dob',
        dataType: 'number',
        className: ''
      }),
      new GenericColumn({
        displayName: 'Avatar',
        name: 'avatar',
        dataType: 'string',
        className: ''
      })
    ];
    return result;
  }

  get propertiesColumns(): GenericColumn[] {
    //Todo properties -> GenericColumn[]
    const result: GenericColumn[] = [];
    if (this.userFullDetailInfo?.profile) {
      for (const key in this.userFullDetailInfo.profile.properties) {
        result.push(new GenericColumn({ displayName: StringUtils.camelToCapitalizedStr(key), name: key, dataType: 'string', className: '' }));
      }
    }
    return result;
  }

  get currentTheme(): DataInsiderTheme {
    return ThemeModule.currentTheme;
  }

  handleChangeDateOfBirth(newDate: Date) {
    Log.debug('new Date::', newDate);
    const request: EditUserProfileRequest = EditUserProfileRequest.createEditRequest(this.userFullDetailInfo?.profile?.username!, {
      dob: newDate.getTime()
    });
    UserProfileDetailModule.editUserProfile(request)
      .then(() => {
        PopupUtils.showSuccess(`${this.userFullDetailInfo?.profile?.fullName}'s profile is updated successfully.`);
      })
      .catch(ex => {
        Log.debug('UserProfileDetailStore::editUserProfile::error::', ex.message);
        PopupUtils.showError(ex.message);
      });
  }

  @Watch('currentGender')
  handleEditGender(genderValue: number) {
    Log.debug('Gender:', genderValue);
    const request: EditUserProfileRequest = EditUserProfileRequest.createEditRequest(this.userFullDetailInfo?.profile?.username!, {
      gender: genderValue
    });
    UserProfileDetailModule.editUserProfile(request)
      .then(() => {
        PopupUtils.showSuccess(`${this.userFullDetailInfo?.profile?.fullName}'s profile is updated successfully.`);
      })
      .catch(ex => {
        Log.debug('UserProfileDetailStore::editUserProfile::error::', ex.message);
        PopupUtils.showError(ex.message);
      });
  }

  //Todo edit contact info
  private handleUpdateContactInfo(newInfo: EditableColumn) {
    const request: EditUserProfileRequest = EditUserProfileRequest.createEditRequest(this.userFullDetailInfo?.profile?.username!, {
      [newInfo.column.name]: newInfo.value
    });
    UserProfileDetailModule.editUserProfile(request)
      .then(() => {
        PopupUtils.showSuccess(`${this.userFullDetailInfo?.profile?.fullName}'s profile is updated successfully.`);
      })
      .catch(ex => {
        Log.debug('UserProfileDetailStore::editUserProfile::error::', ex.message);
        PopupUtils.showError(ex.message);
      });
  }

  private handleUpdateExtraInfo(newExtraInfo: EditableColumn) {
    const request: EditUserProfileRequest = EditUserProfileRequest.createEditRequest(this.userFullDetailInfo?.profile?.username!, {
      properties: {
        ...(this.userFullDetailInfo?.profile?.properties ?? {}),
        [newExtraInfo.column.name]: newExtraInfo.value
      }
    });

    Log.debug('updateContactInfo::editableProfileColumn::request', request);
    UserProfileDetailModule.editUserProfile(request)
      .then(() => {
        PopupUtils.showSuccess(`${this.userFullDetailInfo?.profile?.fullName}'s profile is updated successfully.`);
      })
      .catch(ex => {
        Log.debug('UserProfileDetailStore::editUserProfile::error::', ex.message);
        PopupUtils.showError(ex.message);
      });
  }
}
</script>

<style lang="scss" scoped>
@import '~@/themes/scss/mixin';

.profile-details-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden !important;
  padding-right: 8px;
}

.scroll-area {
  height: calc(100vh - 510px) !important;
  padding-bottom: 24px !important;
}

.profile-field-item {
  margin-left: 16px;
  margin-top: 16px;
  label {
    opacity: 0.5;
    font-size: 12px;
    margin-bottom: 8px;
  }
}

.email {
  padding-bottom: 16px;
  .value {
    //padding: 8px 0;
    height: 42px;
    align-items: center;
    padding-top: 12px;
  }
}

.gender {
  //padding: ;
  label {
    padding-bottom: 8px;
  }
}

.date-of-birth {
  padding-bottom: 20px;
  label {
    padding-bottom: 8px;
  }
}

.date-picker {
  ::v-deep {
    input {
      height: 42px;
      background: var(--secondary);
      color: var(--white);
      border: 0;
      @include regular-text-14();
    }
  }
}
.properties {
  margin-top: 16px;
}

//.swm-select{
//  height: 50px;
//  ::v-deep{
//
//  }
//}
</style>
