import { requireNativeView } from 'expo';
import * as React from 'react';

import { ReactNativeBleLiteViewProps } from './ReactNativeBleLite.types';

const NativeView: React.ComponentType<ReactNativeBleLiteViewProps> =
  requireNativeView('ReactNativeBleLite');

export default function ReactNativeBleLiteView(props: ReactNativeBleLiteViewProps) {
  return <NativeView {...props} />;
}
