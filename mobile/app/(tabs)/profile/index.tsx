import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';
import { recordsApi } from '@/api';
import {
  Card,
  CardContent,
  Avatar,
  LoadingState,
} from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Patient } from '@/types';

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await recordsApi.getPatientProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'personal',
      icon: 'person-outline',
      label: 'Personal Information',
      description: 'Manage your profile details',
      onPress: () => Alert.alert('Coming Soon', 'Personal information editing will be available soon.'),
    },
    {
      id: 'insurance',
      icon: 'card-outline',
      label: 'Insurance Information',
      description: 'View and update insurance',
      onPress: () => Alert.alert('Coming Soon', 'Insurance management will be available soon.'),
    },
    {
      id: 'emergency',
      icon: 'alert-circle-outline',
      label: 'Emergency Contacts',
      description: 'Manage emergency contacts',
      onPress: () => Alert.alert('Coming Soon', 'Emergency contact editing will be available soon.'),
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Notifications',
      description: 'Configure notification preferences',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon.'),
    },
    {
      id: 'security',
      icon: 'shield-checkmark-outline',
      label: 'Security',
      description: 'Password and 2FA settings',
      onPress: () => Alert.alert('Coming Soon', 'Security settings will be available soon.'),
    },
    {
      id: 'privacy',
      icon: 'lock-closed-outline',
      label: 'Privacy',
      description: 'Manage your privacy settings',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon.'),
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help & Support',
      description: 'Get help with the app',
      onPress: () => Alert.alert('Coming Soon', 'Help & Support will be available soon.'),
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      label: 'About',
      description: 'App version and information',
      onPress: () => Alert.alert('PracticeFlux Mobile', 'Version 1.0.0\n\nHIPAA-compliant patient portal'),
    },
    {
      id: 'logout',
      icon: 'log-out-outline',
      label: 'Sign Out',
      onPress: handleLogout,
      danger: true,
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Loading profile..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar
            name={profile ? `${profile.firstName} ${profile.lastName}` : user?.firstName}
            size="xl"
          />
          <Text style={styles.name}>
            {profile ? `${profile.firstName} ${profile.lastName}` : `${user?.firstName} ${user?.lastName}`}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {profile?.mrn && (
            <View style={styles.mrnContainer}>
              <Text style={styles.mrnLabel}>MRN:</Text>
              <Text style={styles.mrnValue}>{profile.mrn}</Text>
            </View>
          )}
        </View>

        {/* Quick Info */}
        {profile && (
          <Card variant="outlined" style={styles.infoCard}>
            <CardContent>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.gray[400]} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date of Birth</Text>
                    <Text style={styles.infoValue}>{profile.dateOfBirth}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color={colors.gray[400]} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone || 'Not set'}</Text>
                  </View>
                </View>
                {profile.address && (
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={20} color={colors.gray[400]} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Address</Text>
                      <Text style={styles.infoValue} numberOfLines={2}>
                        {profile.address.city}, {profile.address.state}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIcon,
                  item.danger && styles.menuIconDanger,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.danger ? colors.error[600] : colors.gray[600]}
                />
              </View>
              <View style={styles.menuContent}>
                <Text
                  style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}
                >
                  {item.label}
                </Text>
                {item.description && (
                  <Text style={styles.menuDescription}>{item.description}</Text>
                )}
              </View>
              {!item.danger && (
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PracticeFlux Mobile v1.0.0</Text>
          <View style={styles.footerBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success[600]} />
            <Text style={styles.footerBadgeText}>HIPAA Compliant</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    backgroundColor: colors.white,
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing[4],
  },
  email: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  mrnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  mrnLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginRight: spacing[1],
  },
  mrnValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
  },
  infoCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  infoGrid: {
    gap: spacing[4],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginBottom: spacing[0.5],
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
  },
  menu: {
    marginTop: spacing[6],
    marginHorizontal: spacing[4],
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing[3],
  },
  menuItemFirst: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: colors.error[50],
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
  },
  menuLabelDanger: {
    color: colors.error[600],
  },
  menuDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[400],
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    gap: spacing[1],
  },
  footerBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.success[600],
    fontWeight: typography.fontWeight.medium,
  },
});
