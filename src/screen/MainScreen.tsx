import React from "react";
import { View } from "react-native";
import DragBottomSheet from "../component/DragBottomSheet";

export default function MainScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "gray" }}>
      <View style={{ flex: 1, backgroundColor: "gray" }} />
      <View>
        <DragBottomSheet contentHeight={300}>
          <View style={{ height: 200, backgroundColor: "black" }} />
        </DragBottomSheet>
      </View>
    </View>
  );
}
