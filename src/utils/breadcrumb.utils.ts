import { ListParentsResponse } from '@core/domain/Response';
import { Breadcrumbs } from '@/shared/models';
import { ListUtils } from '@/utils/list.utils';

export enum BreadcrumbMode {
  Shortly = 'shortly',
  Fully = 'fully'
}

export class BreadcrumbUtils {
  static isFullyBreadcrumbs(parents: ListParentsResponse | null): boolean {
    if (parents) {
      return ListUtils.getHead(parents.parentDirectories)?.parentId === -1 || parents.parentDirectories.length < 3;
    }
    return false;
  }

  static getBreadcrumbMode(parents: ListParentsResponse | null): BreadcrumbMode {
    if (!parents) {
      return BreadcrumbMode.Fully;
    }
    switch (this.isFullyBreadcrumbs(parents)) {
      case true:
        return BreadcrumbMode.Fully;
      case false:
        return BreadcrumbMode.Shortly;
    }
  }

  static getFullyBreadcrumbs(parents: ListParentsResponse | null, routeName: string): Breadcrumbs[] {
    const parentsWithoutRoot = parents?.parentDirectories.filter(parentDirectory => parentDirectory.parentId > 0);
    return (
      parentsWithoutRoot?.map(
        parentDirectory =>
          new Breadcrumbs({
            text: parentDirectory.name,
            to: { name: routeName, params: { directoryId: parentDirectory.id } },
            disabled: false
          })
      ) ?? []
    );
  }

  static getShortlyBreadcrumbs(parents: ListParentsResponse | null, routeName: string): Breadcrumbs[] {
    return [this.defaultBreadcrumb()].concat(ListUtils.removeAt(this.getFullyBreadcrumbs(parents, routeName), 0));
  }

  static defaultBreadcrumb(): Breadcrumbs {
    return new Breadcrumbs({
      text: '...',
      to: { name: '' },
      disabled: true
    });
  }
}
