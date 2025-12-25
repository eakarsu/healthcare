import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, typography } from '@/theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const fontSizeMap = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
};

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (fullName?: string) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyles: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    ...style,
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.image, containerStyles]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, containerStyles]}>
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

interface AvatarGroupProps {
  avatars: { source?: string; name?: string }[];
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'md',
  style,
}: AvatarGroupProps) {
  const dimension = sizeMap[size];
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={[styles.group, style]}>
      {visibleAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            { marginLeft: index > 0 ? -dimension * 0.3 : 0, zIndex: max - index },
          ]}
        >
          <Avatar source={avatar.source} name={avatar.name} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.placeholder,
            styles.remaining,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              marginLeft: -dimension * 0.3,
            },
          ]}
        >
          <Text style={[styles.remainingText, { fontSize: fontSizeMap[size] }]}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: borderRadius.full,
  },
  remaining: {
    backgroundColor: colors.gray[200],
    borderWidth: 2,
    borderColor: colors.white,
  },
  remainingText: {
    color: colors.gray[600],
    fontWeight: typography.fontWeight.semibold,
  },
});

export default Avatar;
