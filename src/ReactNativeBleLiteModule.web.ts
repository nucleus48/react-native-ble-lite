import { registerWebModule, NativeModule } from 'expo';

import { ReactNativeBleLiteModuleEvents } from './ReactNativeBleLite.types';

class ReactNativeBleLiteModule extends NativeModule<ReactNativeBleLiteModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ReactNativeBleLiteModule, 'ReactNativeBleLiteModule');
