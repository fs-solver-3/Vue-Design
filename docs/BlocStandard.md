### Folder

```xpath2
Screens
  | Login
    | Bloc
      | Event
        | LoginEvent.ts
        | install.ts
      | State
        | LoginState.ts
        | install.ts
      | LoginBLoc.ts
      | install.ts
    | Component
      | LoginInput.vue
      | LoginButton.vue
    | LoginScreen.vue
```

### Name

- Bloc
  - Đặt tên theo chức năng của bloc **LoginBloc.ts**. có kết thúc là **Bloc**
  - File Bloc sẽ ở gần với folder **Bloc**
- Event
  - Tên bắt đầu là động từ: **SaveSetting**.
  - Nếu tên bắt đầu từ danh thì thêm hậu tố **Event**: **SchedulerStartupEvent**
- State
  - Tên bắt đầu là danh từ: **SettingSaved** or **SettingSaveCompleted**
  - Nếu tên gây confuse (Bắt đầu bằng động từ, trùng với class khác) thì kết thúc bằng hậu tố **State**:
    **DashboardLoadingState**

### Một số lưu ý

- Muốn hiển thị log thì có thể đưa vô class **DefaultBlocLogger**

```ts
export class SettingBloc extends Bloc<SettingEvent, SettingState> {
  constructor() {
    super(SettingState.default(), new DefaultBlocLogger());
  }
}
```

- Có thể override hàm toString để log thông tin cho event và state

```ts
export class ApplySetting implements SettingEvent {
  constructor(public id: DashboardId, public setting: DashboardSetting) {}

  toString(): string {
    return 'ApplySetting::setting' + this.setting;
  }
}
```

### VueBloc

- Sử dụng khi cần render lại UI

```vue
<VueBloc :bloc="bloc">
  <template #default="{state}">
    <div v-if="isLoading(state)">
      loading
    </div>
    <div v-if="isLoaded(state)">
      loaded
    </div>
    <!--    ...-->
  </template>
</VueBloc>
```

- Có 2 slot: **default** và **empty** với scope là **state**
- Props:
  - **bloc**: là bloc cần listen
  - **renderWhen**:
    - Khi có giá trị **renderWhen** => true sẽ reRender lại giao diện, ngược lại không.
    - Default: luôn render
  - **listenWhen**:
    - Khi có giá trị: **listenWhen** => true sẽ emit event, ngược lại không.
    - Default: Luôn emit

```ts
class VueBloc {
  @Prop({ required: true })
  private readonly bloc!: Bloc;

  @Prop({ required: false, type: Function })
  private renderWhen?: (state: State) => boolean;

  @Prop({ required: false, type: Function })
  private listenWhen?: (state: State) => boolean;
}
```

- Events: **onStateChange: (state: State) => void**

### VueBlocListener

- Sử dụng khi cần listener một state nào đó

```vue
<VueBloc :bloc="bloc" @onStateChanged="handleOnStateChanged">
  <child></child>
</VueBloc>
```

- Props: tương tự như **VueBloc**

```ts
class VueBloc {
  @Prop({ required: true })
  private readonly bloc!: Bloc;

  @Prop({ required: false, type: Function })
  private listenWhen?: (state: State) => boolean;
}
```

- Events: **onStateChange: (state: State) => void**
