import React, { ReactNode, useCallback, useMemo, useState } from "react";

import { FlexStyle, StyleSheet, useWindowDimensions, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

interface IDragBottomSheetTopMargin {
  leftMargin?: number;
  rightMargin?: number;
  bottomMargin?: number;
}

interface IDragBottomSheetProps {
  animateDuration?: number;
  contentHeight?: number;
  backgroundColor?: string;
  addTopLayoutMargin?: IDragBottomSheetTopMargin;
  addTopLayout?: ReactNode;
  children: ReactNode;
}

const TOP_RADIUS_HEIGHT = 24;

const getAddTopLayoutMargin = (
  topHeight: number,
  addTopLayoutMargin?: IDragBottomSheetTopMargin
): FlexStyle => {
  let top = topHeight + TOP_RADIUS_HEIGHT;
  if (addTopLayoutMargin?.bottomMargin) {
    top += addTopLayoutMargin.bottomMargin;
  }
  const margin = { top: -top } as FlexStyle;
  if (addTopLayoutMargin?.leftMargin) {
    margin.left = addTopLayoutMargin.leftMargin;
  }
  if (addTopLayoutMargin?.rightMargin) {
    margin.right = addTopLayoutMargin.rightMargin;
  }
  return margin;
};

/**
 * @name DragBottomSheet
 *
 * Modal Component와 같은 View 레벨에 쓰일 경우, 최상단에 위치하도록 구성
 * <>
 *   <Modal />
 *   <DragBottomSheet />
 * </>
 */
export default function DragBottomSheet({
                                          animateDuration = 200,
                                          contentHeight,
                                          backgroundColor,
                                          addTopLayoutMargin,
                                          addTopLayout,
                                          children
                                        }: IDragBottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();

  const [fixedHeight, setFixedHeight] = useState(0);
  const [addTopHeight, setAddTopHeight] = useState(0);

  const innerContentHeight = useSharedValue(0);
  const lastCurrentHeight = useSharedValue(0);

  const background = useMemo(() => {
    return {
      backgroundColor: '#FFFFFF'
    };
  }, [backgroundColor]);

  const maxHeight = useMemo(() => {
    return windowHeight * 0.8 - addTopHeight - TOP_RADIUS_HEIGHT;
  }, [addTopHeight, windowHeight]);

  const setContentHeight = useCallback(
    (currentHeight: number) => {
      if (currentHeight > 0) {
        setFixedHeight(currentHeight);
        innerContentHeight.value = currentHeight;
      }
    },
    [innerContentHeight]
  );

  const sheetHeightAnimatedStyle = useAnimatedStyle(() => ({
    height: innerContentHeight.value
  }));

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: () => {
      lastCurrentHeight.value = innerContentHeight.value;
    },
    onActive: (ev) => {
      if (ev.translationY === 0) return;

      const changeHeight = -ev.y + innerContentHeight.value + addTopHeight;
      // const changeHeight =
      //   ev.translationY > 0
      //     ? TOP_RADIUS_HEIGHT / 2 + -ev.y + contentsHeight.value
      //     : -ev.y + contentsHeight.value;

      if (maxHeight < changeHeight) {
        innerContentHeight.value = maxHeight;
      } else if (fixedHeight > changeHeight) {
        innerContentHeight.value = fixedHeight;
      } else {
        innerContentHeight.value = changeHeight;
      }
    },
    onEnd: () => {
      if (lastCurrentHeight.value === innerContentHeight.value) {
        return;
      }
      if (lastCurrentHeight.value > innerContentHeight.value) {
        // Down
        innerContentHeight.value = withTiming(fixedHeight, {
          duration: animateDuration
        });
      } else {
        // Up
        innerContentHeight.value = withTiming(maxHeight, {
          duration: animateDuration
        });
      }
    }
  });

  return (
    <View>
      {/* Add Layout */}
      {addTopLayout && (
        <View
          style={[
            { position: "absolute" },
            getAddTopLayoutMargin(addTopHeight, addTopLayoutMargin)
          ]}
        >
          <View
            onLayout={(event) => {
              setAddTopHeight(event.nativeEvent.layout.height);
            }}
          >
            {addTopLayout}
          </View>
        </View>
      )}
      {/* Drag */}
      <View
        style={[StyleSheet.absoluteFillObject, { top: -TOP_RADIUS_HEIGHT }]}
      >
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View
            style={[
              styles.topContainer,
              styles.shadow,
              background,
              { height: TOP_RADIUS_HEIGHT },
              { justifyContent: "center", alignItems: "center" }
            ]}
          >
            <View style={styles.dragView} />
          </Animated.View>
        </PanGestureHandler>
      </View>
      {/* Contents */}
      <Animated.View style={[sheetHeightAnimatedStyle, background]}>
        <View>
          <View
            style={styles.content}
            onLayout={(event) => {
              if (contentHeight && contentHeight > 0) {
                setContentHeight(contentHeight);
              } else {
                setContentHeight(event.nativeEvent.layout.height);
              }
            }}
          >
            {children}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0
  },
  dragView: {
    width: 25,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E0E0E0'
  },
  topContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  shadow: {
    shadowRadius: 4,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    elevation: 10,
    shadowColor: '#000000'
  }
});
