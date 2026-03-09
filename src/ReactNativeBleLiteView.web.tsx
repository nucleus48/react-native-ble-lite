import * as React from 'react';

import { ReactNativeBleLiteViewProps } from './ReactNativeBleLite.types';

export default function ReactNativeBleLiteView(props: ReactNativeBleLiteViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
