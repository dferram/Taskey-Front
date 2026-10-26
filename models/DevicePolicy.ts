export interface DevicePolicy {
  sleep_enabled: boolean;
  id: string;
  child_id: string;
  available_screen_time_minutes: number;
  sleep_start_time: string; 
  sleep_end_time: string; 
  sleep_days: string; 
  restricted_apps: any; 
  created_at?: string;
  updated_at?: string;
}
