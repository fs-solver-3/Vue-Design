export abstract class PermissionProvider {
  protected buildPerm(domain: string, action?: string, resourceId?: string): string {
    return this.buildPermWithParts([domain, action ?? '*', resourceId ?? '*']);
  }

  protected buildPermWithParts(parts: string[]): string {
    return parts.join(':');
  }
}
