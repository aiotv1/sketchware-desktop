// Icon names Sketchware Pro uses for views, components and events
// (ViewBean.getViewTypeResId, ViewBeans.getViewTypeResId, ComponentBean.getIconResource, EventBean.getEventIconResource).

const VIEW: Record<number, string> = {
  0: 'ic_mtrl_view_horizontal',
  1: 'ic_mtrl_view_relative',
  2: 'ic_mtrl_swipe_horizontal',
  3: 'ic_mtrl_button_click',
  4: 'ic_mtrl_formattext',
  5: 'ic_mtrl_edittext',
  6: 'ic_mtrl_image',
  7: 'ic_mtrl_web',
  8: 'ic_mtrl_progress_bar',
  9: 'ic_mtrl_list',
  10: 'ic_mtrl_spinner',
  11: 'ic_mtrl_checkbox',
  12: 'ic_mtrl_swap_vertical',
  13: 'ic_mtrl_toggle',
  14: 'ic_mtrl_seekbar',
  15: 'ic_mtrl_calendar',
  16: 'ic_mtrl_fab',
  17: 'ic_mtrl_ad',
  18: 'ic_mtrl_map',
  19: 'ic_mtrl_radio_btn',
  20: 'ic_mtrl_star',
  21: 'ic_mtrl_video',
  22: 'ic_mtrl_search',
  23: 'ic_mtrl_edittext',
  24: 'ic_mtrl_edittext',
  25: 'ic_mtrl_web',
  26: 'ic_mtrl_time',
  27: 'ic_mtrl_time',
  28: 'ic_mtrl_calendar',
  29: 'ic_mtrl_time',
  30: 'ic_mtrl_tabs',
  31: 'ic_mtrl_viewpager',
  32: 'ic_mtrl_bottom_navigation',
  33: 'ic_mtrl_badge',
  34: 'ic_mtrl_pattern',
  35: 'ic_mtrl_sidebar',
  36: 'ic_mtrl_rectangle',
  37: 'ic_mtrl_collapsing_toolbar',
  38: 'ic_mtrl_edittext',
  39: 'ic_mtrl_refresh',
  40: 'ic_mtrl_radio_partitial',
  41: 'ic_mtrl_button_click',
  42: 'ic_mtrl_login',
  43: 'ic_mtrl_camera',
  44: 'ic_mtrl_animation',
  45: 'ic_mtrl_youtube',
  46: 'ic_mtrl_password',
  47: 'ic_mtrl_terminal',
  48: 'ic_mtrl_list',
  49: 'ic_mtrl_grid',
};

/** Linear layouts show the vertical icon when their orientation is vertical, like the palette does. */
export function viewIcon(type: number, orientation?: number): string {
  if (type === 0 && orientation === 1) return 'ic_mtrl_view_vertical';
  return VIEW[type] ?? 'ic_mtrl_component';
}

const COMPONENT: Record<number, string> = {
  1: 'ic_mtrl_version_control',
  2: 'ic_mtrl_save',
  3: 'ic_mtrl_calendar',
  4: 'ic_mtrl_vibration',
  5: 'ic_mtrl_timer',
  6: 'ic_mtrl_firebase_rtdb',
  7: 'ic_mtrl_dialog',
  8: 'ic_mtrl_video',
  9: 'ic_mtrl_volume',
  10: 'ic_mtrl_animation',
  11: 'ic_mtrl_sensors',
  12: 'ic_mtrl_firebase_auth',
  13: 'ic_mtrl_admob',
  14: 'ic_mtrl_firebase_storage',
  15: 'ic_mtrl_camera',
  16: 'ic_mtrl_file',
  17: 'ic_mtrl_wifi',
  18: 'ic_mtrl_tts',
  19: 'ic_mtrl_stt',
  20: 'ic_mtrl_bluetooth',
  21: 'ic_mtrl_location',
  22: 'ic_mtrl_screen_play',
  23: 'ic_mtrl_progress',
  24: 'ic_mtrl_calendar_add',
  25: 'ic_mtrl_time',
  26: 'ic_mtrl_notifications',
  27: 'ic_mtrl_viewpager',
  28: 'ic_mtrl_firebase_sms',
  30: 'ic_mtrl_firebase_cloud',
  31: 'ic_mtrl_firebase_google',
};

export function componentIcon(type: number): string {
  return COMPONENT[type] ?? 'ic_mtrl_component';
}

/** Event list icon: activity events use the code icon, others their target's icon. */
export function eventIcon(eventType: number, targetType: number): string {
  if (eventType === 1 || eventType === 4) return viewIcon(targetType);
  if (eventType === 2) return componentIcon(targetType);
  if (eventType === 3) return 'ic_mtrl_code';
  return 'ic_mtrl_moreblock';
}
