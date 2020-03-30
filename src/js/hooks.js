/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const React = require('react');
const { useCallback, useEffect, useMemo, useRef } = React;
const { StyleSheet, findNodeHandle, View } = require('react-native');

export function useViewProp(arg, key, refToUpdate) {
  const viewRef = useRef();

  const update = useCallback((viewTag) => {
    refToUpdate.current && refToUpdate.current.setNativeProps({ [key]: viewTag });
  }, [refToUpdate, key]);

  useEffect(() => {
    let t;
    if (arg && typeof arg !== 'number') {
      t = setImmediate(() => {
        const isElementProp = typeof arg === 'function' || React.isValidElement(arg);
        let viewTag = null;
        if (isElementProp) {
          viewTag = viewRef.current ? findNodeHandle(viewRef.current) : null;
        } else if (arg.current) {
          viewTag = arg.current ? findNodeHandle(arg.current) : null;
        }
        update(viewTag);
        clearImmediate(t);
      });
    }
    return () => clearImmediate(t);
  }, [arg, update]);

  const refHandler = useCallback((r) => {
    const viewTag = r ? findNodeHandle(r) : null;
    viewRef.current = r;
    update(viewTag)
  }, [update]);

  return useMemo(() => {
    const element = typeof arg === 'function' ?
      arg() :
      React.isValidElement(arg) ?
        arg :
        null;

    if (element === null) {
      return null;
    } else {
      return (
        <View
          pointerEvents='none'
          style={styles.container}
        >
          {React.cloneElement(element, {
            ref: refHandler,
            collapsable: false
          })}
        </View>
      );
    }
  }, [arg, refHandler]);
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0
  }
});
