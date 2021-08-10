## Naming convention

- Tên biến sử dụng **camelCase**
- Tên class sử dụng **PascalCase**
- Tên enum sử dụng **PascalCase**
- Tên folder đặt **PascalCase**
- File \*.Vue
  - Tên scss sử dụng dạng **login-button**
  - Tên file scss sử dụng dạng \*_login-screen.scss_ \*
  - File .ts sử dụng dạng **LoginScreen.ts**
  - File .vue sử dụng dạng **LoginScreen.vue**

### Import trong di_core

- Interface hoặc abstract: phải có _fromObject_ và sử dụng import tương đối `~@core/`

```ts
import { BoolColumn } from '@core/domain/Model';
export abstract class Column {
  static fromObject(obj: any): Column | undefined {
    switch (obj.className) {
      case ColumnType.bool:
        return BoolColumn.fromObject(obj);
      default:
        Log.info(`fromObject: object with className ${obj.className} not found`, obj);
        return void 0;
    }
  }
}
```

- Với lớp implement: sử dụng import tuyệt đối với interface hoặc abstract

```ts
import { Column } from '@core/domain/Model/Column/Column';

export class BoolColumn extends Column {
  static fromObject(obj: BoolColumn): BoolColumn {
    const defaultExpression = obj.defaultExpression ? Expression.fromObject(obj.defaultExpression) : void 0;
    return new BoolColumn(obj.name, obj.displayName, obj.isNullable, obj.description, obj.defaultValue, defaultExpression);
  }
}
```

- Nếu bị lỗi import thì sử dụng import càng gần với file đó nhất. Ví dụ file QuerySetting.ts
  - Dùng `@core/domain/Modal` hơn là dùng `@core/domain`

### File index trong di_core

- Không được define bất cứ method, function, class nào trong install.ts
- Sử dụng `yarn create:index [path]` để tạo thư mục index

```sh
# tạo file index cho di_core/domain và sub folder
yarn create:index di_core/domain
```

- Khi sử dụng core thì chỉ cần `import { /// } from '@core/domain'`;

### Quy chuẩn đặt tên tests

- File test phải có đuôi là `[Name]Test.ts` ex: `CookieTest.ts`
- Test services sẽ đặt trong file servies, tương tự với respository và utils
- Nếu test của từng submodule sẽ phải đưa vào trong module đó. Ví dụ test **Login** của module **Authentication** thì
  folder sẽ là `di_core/Authentication/Services/LoginTest.ts`
- **describe** trong test sẽ diễn tả là test 1 feature lớn ví dụ `Test Cookie Manager`
- **it** diễn tả một case sẽ diễn ra ví dụ `should remove value in cookie successful`
