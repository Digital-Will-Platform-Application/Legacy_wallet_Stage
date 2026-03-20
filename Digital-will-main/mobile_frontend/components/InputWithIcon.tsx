import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { colors, radius } from '@/lib/theme';

type Props = TextInputProps & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export function InputWithIcon({ leftIcon, rightIcon, containerStyle, style, ...props }: Props) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, leftIcon ? styles.inputWithLeft : null, rightIcon ? styles.inputWithRight : null, style]}
        {...props}
      />
      {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.foreground,
  },
  inputWithLeft: { paddingLeft: 44 },
  inputWithRight: { paddingRight: 44 },
  leftIcon: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
});
