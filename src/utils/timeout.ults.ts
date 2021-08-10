export abstract class TimeoutUtils {
  public static waitAndExec(oldId?: number | null, fn?: () => void, time = 1000): number {
    if (oldId) {
      clearTimeout(oldId);
    }
    if (fn) {
      return window.setTimeout(fn, time);
    } else {
      return -1;
    }
  }
}
