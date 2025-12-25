import React from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { layout, borderRadius as br } from '@/theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  borderColor?: string;
  showBorder?: boolean;
}

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  style,
  borderColor,
  showBorder = false,
}) => {
  const theme = useTheme();
  const dimension = layout.avatar[size];

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    ...(showBorder && {
      borderWidth: 2,
      borderColor: borderColor || theme.colors.primary,
    }),
    ...style,
  };

  const imageStyle: ImageStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'xs': return 10;
      case 'sm': return 12;
      case 'md': return 14;
      case 'lg': return 18;
      case 'xl': return 24;
      case 'xxl': return 32;
      default: return 14;
    }
  };

  if (source) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: source }}
          style={imageStyle}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        containerStyle,
        styles.placeholder,
        { backgroundColor: theme.colors.primaryLight },
      ]}
    >
      <Text
        style={{ fontSize: getFontSize(), fontWeight: '600' }}
        color={theme.colors.primary}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

export interface AvatarGroupProps {
  avatars: { source?: string; name?: string }[];
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  style,
}) => {
  const theme = useTheme();
  const dimension = layout.avatar[size];
  const overlap = dimension * 0.3;

  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={[styles.group, style]}>
      {visible.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            {
              marginLeft: index > 0 ? -overlap : 0,
              zIndex: max - index,
              borderWidth: 2,
              borderColor: theme.colors.background,
              borderRadius: dimension / 2,
            },
          ]}
        >
          <Avatar source={avatar.source} name={avatar.name} size={size} />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupItem,
            styles.remainingBadge,
            {
              marginLeft: -overlap,
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: theme.colors.backgroundTertiary,
              borderWidth: 2,
              borderColor: theme.colors.background,
            },
          ]}
        >
          <Text variant="caption" color={theme.colors.textSecondary} weight="600">
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    overflow: 'hidden',
  },
  remainingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
