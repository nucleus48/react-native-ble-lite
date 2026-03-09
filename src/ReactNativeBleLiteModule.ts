import { NativeModule, requireNativeModule } from 'expo';

import { ReactNativeBleLiteModuleEvents } from './ReactNativeBleLite.types';

declare class ReactNativeBleLiteModule extends NativeModule<ReactNativeBleLiteModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeBleLiteModule>('ReactNativeBleLite');
