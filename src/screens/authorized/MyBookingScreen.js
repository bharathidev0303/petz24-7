import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import RequestErrorState from '../../components/view/RequestErrorState';
import { Calendar } from '../../components/icons';
import { colors } from '../../styles/colors';
import { ordersAPI } from '../../api/orders';
import { getAssetUrl } from '../../config/env';
import { getUserErrorMessage } from '../../utils/apiError';

const BOOKING_TABS = [
  { id: 'slot', label: 'Slot Booking' },
  { id: 'quick', label: 'Quick Booking' },
  { id: 'chat', label: 'Chat Bookings' },
];

const PAGE_WIDTH = Dimensions.get('window').width;

const EMPTY_MESSAGES = {
  slot: 'No slot bookings yet.',
  quick: 'No quick bookings yet.',
  chat: 'No chat bookings yet.',
};

const stageColor = stage => {
  const value = String(stage || '').toLowerCase();
  if (value === 'done' || value === 'completed') return colors.success;
  if (value === 'cancelled' || value === 'canceled') return colors.error;
  return colors.primary;
};

const formatStageLabel = stage => stage || 'Pending';

const capitalize = value =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const parseBookingMeta = item => {
  try {
    return JSON.parse(item?.booking_json || '{}');
  } catch {
    return {};
  }
};

const StageBadge = ({ stage }) => (
  <View style={[styles.badge, { backgroundColor: `${stageColor(stage)}20` }]}>
    <AppText style={[styles.badgeText, { color: stageColor(stage) }]}>
      {formatStageLabel(stage)}
    </AppText>
  </View>
);

const SlotBookingCard = ({ booking }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <AppText style={styles.cardTitle}>{booking.plan_name || 'Slot Booking'}</AppText>
      <StageBadge stage={booking.booking_stage} />
    </View>

    <View style={styles.metaRow}>
      <Calendar width={16} height={16} color={colors.primary} />
      <AppText style={styles.metaText}>{booking.booking_date || '—'}</AppText>
    </View>
    <AppText style={styles.metaText}>
      {booking.from_time && booking.to_time
        ? `${booking.from_time} - ${booking.to_time}`
        : 'Time not available'}
    </AppText>
    <AppText style={styles.bookingId}>Booking #{booking.booking_id}</AppText>
  </View>
);

const QuickBookingCard = ({ booking }) => {
  const meta = parseBookingMeta(booking);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText style={styles.cardTitle}>Quick Booking</AppText>
        <StageBadge stage={booking.booking_stage} />
      </View>

      {meta.doctor_name ? <AppText style={styles.metaText}>Doctor: {meta.doctor_name}</AppText> : null}
      {meta.language ? <AppText style={styles.metaText}>Language: {meta.language}</AppText> : null}
      {booking.whatsapp_number ? (
        <AppText style={styles.metaText}>WhatsApp: {booking.whatsapp_number}</AppText>
      ) : null}
      {booking.payment_status ? (
        <AppText style={styles.metaText}>Payment: {capitalize(booking.payment_status)}</AppText>
      ) : null}
      {booking.booking_status ? (
        <AppText style={styles.metaText}>Status: {capitalize(booking.booking_status)}</AppText>
      ) : null}
      {booking.created_at ? <AppText style={styles.subMeta}>{booking.created_at}</AppText> : null}
      <AppText style={styles.bookingId}>Quick Booking #{booking.qb_id}</AppText>
    </View>
  );
};

const ChatBookingCard = ({ booking }) => {
  const meta = parseBookingMeta(booking);
  const problemImage = booking.pet_problem_img
    ? getAssetUrl(
        booking.pet_problem_img.startsWith('uploads/')
          ? booking.pet_problem_img
          : `uploads/chat/${booking.pet_problem_img}`,
      )
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText style={styles.cardTitle}>Chat Booking</AppText>
        <StageBadge stage={booking.booking_stage} />
      </View>

      {meta.user_pet_name ? (
        <AppText style={styles.metaText}>Pet: {meta.user_pet_name}</AppText>
      ) : null}
      {meta.doctor_name ? <AppText style={styles.metaText}>Doctor: {meta.doctor_name}</AppText> : null}
      {booking.pet_problem ? (
        <AppText style={styles.metaText}>Problem: {booking.pet_problem}</AppText>
      ) : null}
      {booking.whatsapp_number ? (
        <AppText style={styles.metaText}>WhatsApp: {booking.whatsapp_number}</AppText>
      ) : null}
      {booking.payment_status ? (
        <AppText style={styles.metaText}>Payment: {capitalize(booking.payment_status)}</AppText>
      ) : null}
      {booking.booking_status ? (
        <AppText style={styles.metaText}>Status: {capitalize(booking.booking_status)}</AppText>
      ) : null}
      {problemImage ? (
        <Image source={{ uri: problemImage }} style={styles.problemImage} resizeMode="cover" />
      ) : null}
      {booking.created_at ? <AppText style={styles.subMeta}>{booking.created_at}</AppText> : null}
      <AppText style={styles.bookingId}>Chat Booking #{booking.cb_id}</AppText>
    </View>
  );
};

const getBookingId = (booking, tabId) => {
  if (tabId === 'quick') return booking.qb_id;
  if (tabId === 'chat') return booking.cb_id;
  return booking.booking_id;
};

const BookingListPage = ({ tabId, data, refreshing, onRefresh, onBookingPress }) => {
  const renderItem = ({ item }) => {
    const card =
      tabId === 'quick' ? (
        <QuickBookingCard booking={item} />
      ) : tabId === 'chat' ? (
        <ChatBookingCard booking={item} />
      ) : (
        <SlotBookingCard booking={item} />
      );

    return (
      <Pressable
        onPress={() => onBookingPress(item, tabId)}
        style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}>
        {card}
      </Pressable>
    );
  };

  const keyExtractor = (item, index) => {
    if (item.booking_id) return `slot-${item.booking_id}`;
    if (item.qb_id) return `quick-${item.qb_id}`;
    if (item.cb_id) return `chat-${item.cb_id}`;
    return `${tabId}-${index}`;
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, !data.length && styles.listContentEmpty]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <AppText style={styles.emptyText}>{EMPTY_MESSAGES[tabId]}</AppText>
          </View>
        }
      />
    </View>
  );
};

const MyBookingScreen = () => {
  const navigation = useNavigation();
  const pagerRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('slot');
  const [slotBookings, setSlotBookings] = useState([]);
  const [quickBookings, setQuickBookings] = useState([]);
  const [chatBookings, setChatBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const activeTabIndex = useMemo(
    () => Math.max(0, BOOKING_TABS.findIndex(tab => tab.id === activeTab)),
    [activeTab],
  );

  const syncPagerToActiveTab = useCallback(
    (animated = false) => {
      pagerRef.current?.scrollTo({
        x: activeTabIndex * PAGE_WIDTH,
        animated,
      });
    },
    [activeTabIndex],
  );

  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;

      if (isRefresh) {
        setRefreshing(true);
      } else if (!hasLoadedRef.current) {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await ordersAPI.getMyBooking(user.id);
        setSlotBookings(Array.isArray(response?.Booking) ? response.Booking : []);
        setQuickBookings(Array.isArray(response?.QuickBookings) ? response.QuickBookings : []);
        setChatBookings(Array.isArray(response?.ChatBookings) ? response.ChatBookings : []);
        hasLoadedRef.current = true;
      } catch (err) {
        setError(getUserErrorMessage(err, 'Could not load bookings'));
        if (!hasLoadedRef.current) {
          setSlotBookings([]);
          setQuickBookings([]);
          setChatBookings([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    hasLoadedRef.current = false;
    setLoading(true);
    setError(null);
    setActiveTab('slot');
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useFocusEffect(
    useCallback(() => {
      syncPagerToActiveTab(false);
    }, [syncPagerToActiveTab]),
  );

  useEffect(() => {
    if (!loading && !error) {
      requestAnimationFrame(() => syncPagerToActiveTab(false));
    }
  }, [loading, error, syncPagerToActiveTab]);

  const bookingLists = useMemo(
    () => ({
      slot: slotBookings,
      quick: quickBookings,
      chat: chatBookings,
    }),
    [slotBookings, quickBookings, chatBookings],
  );

  const goToTab = useCallback(tabId => {
    const index = BOOKING_TABS.findIndex(tab => tab.id === tabId);
    if (index < 0) return;

    setActiveTab(tabId);
    pagerRef.current?.scrollTo({ x: index * PAGE_WIDTH, animated: true });
  }, []);

  const handlePageSwipe = useCallback(
    event => {
      const index = Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH);
      const tab = BOOKING_TABS[index];
      if (tab && tab.id !== activeTab) {
        setActiveTab(tab.id);
      }
    },
    [activeTab],
  );

  const openBookingDetail = useCallback(
    (booking, tabId) => {
      const bookingId = getBookingId(booking, tabId);
      if (!bookingId) return;

      navigation.navigate('BookingDetail', {
        bookingId,
        bookingType: tabId,
        booking,
      });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <SubScreenHeader title="My Booking" onBack={() => navigation.goBack()} />

      <View style={styles.tabBar}>
        {BOOKING_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => goToTab(tab.id)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}>
              <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <RequestErrorState error={error} onRetry={() => fetchBookings()} />
      ) : (
        <>
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handlePageSwipe}
            onLayout={() => syncPagerToActiveTab(false)}
            scrollEventThrottle={16}
            style={styles.pager}
            contentContainerStyle={styles.pagerContent}>
            {BOOKING_TABS.map(tab => (
              <BookingListPage
                key={tab.id}
                tabId={tab.id}
                data={bookingLists[tab.id]}
                refreshing={refreshing}
                onRefresh={() => fetchBookings(true)}
                onBookingPress={openBookingDetail}
              />
            ))}
          </ScrollView>

          <View style={styles.bottomBar}>
            <Button onPress={() => navigation.navigate('Booking')}>New Booking</Button>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexGrow: 1,
  },
  page: {
    width: PAGE_WIDTH,
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressable: {
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryText,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  subMeta: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  problemImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: colors.lightGray,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default MyBookingScreen;
