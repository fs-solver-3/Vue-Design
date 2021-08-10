/*
 * @author: tvc12 - Thien Vi
 * @created: 3/29/21, 11:31 AM
 */

export enum DashboardEvents {
  // Event for show widget as full size with param: chartInfo
  showWidgetFullSize = 'show_widget_full_size',
  hideWidgetFullSize = 'hide_widget_full_size',
  resizeWidget = 'on_resize_widget',
  ClickDataPoint = 'click_data_point',
  ShowDrillDown = 'show_drilldown',
  HideDrillDown = 'hide_drilldown',
  ShowWidgetContextMenu = 'show_widget_context_menu'
}
