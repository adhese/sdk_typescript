import type { AdheseSlotOptions, AdheseSlot as Slot } from '@adhese/sdk/core';
import { watch } from '@adhese/sdk-shared/core';
import { type ReactNode, useCallback, useId, useMemo } from 'react';
import { Image, Linking, type ViewProps, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAdheseSlot } from './useAdheseSlot';
import { useWatch } from './useWatch';

export type AdheseSlotRenderMode = 'webview' | 'image' | 'none';

export type AdheseSlotProps = {
  /**
   * Placeholder to be shown when the slot is not rendered yet.
   */
  placeholder?: ReactNode;
  /**
   * Callback to be called when the slot is created or disposed.
   */
  onChange?(slot: Slot | null): void;
  /**
   * Inject custom React Native elements into the slot when it's rendered.
   * When provided, the slot uses renderMode 'none' and lets you handle display.
   */
  render?(slot: Slot): ReactNode;
  /**
   * How to display the ad in React Native.
   * - 'webview' (default): Renders HTML tag content in a WebView
   * - 'image': Renders as a native Image (for simple image ads)
   * - 'none': No rendering (use the `render` prop for custom rendering)
   */
  displayMode?: AdheseSlotRenderMode;
} & Omit<AdheseSlotOptions, 'containingElement' | 'context' | 'renderMode'> & ViewProps;

/**
 * Wraps an ad tag in a proper HTML document for WebView rendering.
 */
function wrapInHtmlDoc(tag: string, width?: number | string, height?: number | string): string {
  if (/^<!DOCTYPE\s+/i.test(tag)) {
    return tag;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            ${width ? `width: ${typeof width === 'number' ? `${width}px` : width};` : ''}
            ${height ? `height: ${typeof height === 'number' ? `${height}px` : height};` : ''}
          }
        </style>
      </head>
      <body>
        ${tag}
      </body>
    </html>
  `.trim();
}

/**
 * Attempts to extract an image URL from a simple <img> tag.
 * Returns null if the tag is not a simple image.
 */
function extractImageUrl(tag: string): string | null {
  const match = tag.match(/^<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/**
 * Component to create an Adhese slot in React Native.
 * The slot will be disposed when the component is unmounted.
 *
 * Supports three display modes:
 * - `webview` (default): Renders the ad HTML in a WebView
 * - `image`: Renders a native Image (for simple image ads)
 * - `none`: No automatic rendering (use `render` prop for full control)
 */
export function AdheseSlot({
  onChange,
  width,
  height,
  lazyLoading,
  lazyLoadingOptions,
  slot,
  pluginOptions,
  type,
  setup,
  parameters,
  format,
  render,
  placeholder,
  displayMode = 'webview',
  style,
  ...props
}: AdheseSlotProps): ReactNode {
  const reactId = useId().replaceAll(':', '');

  const slotState = useAdheseSlot({
    width,
    height,
    lazyLoading,
    lazyLoadingOptions,
    slot,
    pluginOptions,
    type,
    parameters,
    format,
    setup: useCallback(((context, hooks): void => {
      setup?.(context, hooks);

      watch(context, (newSlot) => {
        onChange?.(newSlot);
      }, { immediate: true, deep: true });
    }) satisfies AdheseSlotOptions['setup'], [setup, onChange]),
  });

  const status = useWatch(slotState ? (): Slot['status'] => slotState.status : undefined);
  const name = useWatch(slotState ? (): Slot['name'] => slotState.name : undefined);
  const data = useWatch(slotState ? (): Slot['data'] => slotState.data : undefined, { deep: true });

  const renderOutput = useMemo(() => {
    if (!slotState || !data)
      return placeholder;

    // Custom render function takes priority
    if (render)
      return render(slotState);

    if (typeof data.tag !== 'string')
      return placeholder;

    // Image mode: try to extract image URL
    if (displayMode === 'image') {
      const imageUrl = extractImageUrl(data.tag);
      if (imageUrl) {
        return (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: typeof width === 'number' ? width : undefined,
              height: typeof height === 'number' ? height : undefined,
            }}
            resizeMode="contain"
          />
        );
      }
    }

    // WebView mode (default): render HTML in WebView
    if (displayMode === 'webview' || displayMode === 'image') {
      return (
        <WebView
          source={{ html: wrapInHtmlDoc(data.tag, width, height) }}
          style={{
            width: typeof width === 'number' ? width : undefined,
            height: typeof height === 'number' ? height : undefined,
            opacity: 0.99, // Workaround for WebView rendering issues on Android
          }}
          scrollEnabled={false}
          javaScriptEnabled
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mixedContentMode="compatibility"
          onShouldStartLoadWithRequest={(request) => {
            // Allow the initial HTML load, but open any link clicks in the system browser
            if (request.navigationType === 'click' || (request.url.startsWith('http') && request.url !== 'about:blank')) {
              Linking.openURL(request.url);
              return false;
            }
            return true;
          }}
        />
      );
    }

    return placeholder;
  }, [slotState, render, placeholder, data, displayMode, width, height]);

  // Trigger render on the SDK slot when we have data
  useMemo(() => {
    if (slotState && data && status === 'loaded') {
      slotState.render().catch(() => {});
    }
  }, [slotState, data, status]);

  if (['error', 'empty'].includes(status ?? '')) {
    return null;
  }

  return (
    <View
      testID={`adhese-slot-${reactId}`}
      accessibilityLabel={`Ad slot ${name}`}
      style={[
        {
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
        },
        style,
      ]}
      {...props}
    >
      {renderOutput}
    </View>
  );
}
