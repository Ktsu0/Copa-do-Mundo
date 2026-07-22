import React from "react";
import { StatusBar, StyleSheet, View, ViewProps } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
  edges?: readonly Edge[];
}

export function Screen({
  children,
  style,
  noPadding = false,
  edges = ["top", "left", "right", "bottom"],
  ...props
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <View
        style={[styles.container, !noPadding && styles.padding, style]}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  padding: {
    paddingHorizontal: theme.spacing.md,
  },
});
