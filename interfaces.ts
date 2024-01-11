export interface Device {
  state: boolean;
}

export interface Devices {
  [key: string]: Device;
}

export interface DeviceEvent {
    id: string;
    state: boolean;
}