export interface Device {
  name: string;
  state: boolean;
}

export interface Devices {
  [key: string]: Device;
}

export interface DeviceEvent {
  id: string;
  state: boolean;
}