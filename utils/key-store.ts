import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface DeviceStotage {
  set: (key: string, value: string) => Promise<void>;
  get: (key: string) => Promise<string | null>;
}

export function createDeviceStore(): DeviceStotage {
  return Platform.OS == "web" ? new WebStorage() : new MobileStorage();
}

export class MobileStorage implements DeviceStotage {
  async set(key: string, value: string) {
    SecureStore.setItemAsync(key, value);
  }
  async get(key: string) {
    return SecureStore.getItemAsync(key);
  }
}

export class WebStorage implements DeviceStotage {
  async set(key: string, value: string) {
    AsyncStorage.setItem(key, value);
  }
  async get(key: string) {
    return AsyncStorage.getItem(key);
  }
}
