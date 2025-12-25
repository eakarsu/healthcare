import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { TextVariant, textVariants } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  align,
  weight,
  italic,
  underline,
  strikethrough,
  uppercase,
  lowercase,
  capitalize,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const variantStyle = textVariants[variant];
  const textColor = color || theme.colors.text;

  const textStyle: TextStyle = {
    ...variantStyle,
    color: textColor,
    ...(align && { textAlign: align }),
    ...(weight && { fontWeight: weight }),
    ...(italic && { fontStyle: 'italic' }),
    ...(underline && { textDecorationLine: 'underline' }),
    ...(strikethrough && { textDecorationLine: 'line-through' }),
    ...(uppercase && { textTransform: 'uppercase' }),
    ...(lowercase && { textTransform: 'lowercase' }),
    ...(capitalize && { textTransform: 'capitalize' }),
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

// Convenience components
export const Heading1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h4" {...props} />
);

export const Paragraph: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" color={props.color} {...props} />
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label" {...props} />
);

export default Text;
