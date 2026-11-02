export type PosDeviceStatus = "active";

export interface PosDevice {
  id: string;
  device_name: string;
  device_model: string;
  os_name: string;
  os_version: string;
  status: PosDeviceStatus;
  created_at: string;
  user_agent?: string;
}

export interface InitiatePosDeviceLinkResponse {
  otp: string;
  expires_at: string;
  expires_in_seconds: number;
}
