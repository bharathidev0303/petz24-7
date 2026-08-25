import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import SubScreenHeader from '../../components/view/SubScreenHeader';
import AddressCard from '../../components/view/AddressCard';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import RequestErrorState from '../../components/view/RequestErrorState';
import { AppToastService } from '../../components/view/AppToast';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';
import { addressAPI } from '../../api/address';
import { getUserErrorMessage } from '../../utils/apiError';
import { formatAddressName } from '../../utils/address';

const AddressListScreen = () => {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const hasLoadedRef = useRef(false);
  const { user } = useSelector(state => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAddresses = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) return;

      if (isRefresh) {
        setRefreshing(true);
      } else if (!hasLoadedRef.current) {
        setLoading(true);
      }
      setError(null);

      try {
        const list = await addressAPI.getUserAddress(user.id);
        setAddresses(list);
        hasLoadedRef.current = true;
      } catch (err) {
        setError(getUserErrorMessage(err, 'Could not load addresses'));
        if (!hasLoadedRef.current) {
          setAddresses([]);
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
  }, [user?.id]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        fetchAddresses(true);
      }
    }, [fetchAddresses]),
  );

  const handleEdit = useCallback(
    address => {
      navigation.navigate('AddAddress', { address });
    },
    [navigation],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget?.address_id) return;

    setDeleting(true);
    try {
      await addressAPI.deleteUserAddress(deleteTarget.address_id);
      setAddresses(prev => prev.filter(item => item.address_id !== deleteTarget.address_id));
      AppToastService.show('Address deleted successfully', 'success');
      setDeleteTarget(null);
    } catch (err) {
      AppToastService.show(getUserErrorMessage(err, 'Could not delete address'), 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  return (
    <View style={styles.container}>
      <SubScreenHeader title="Your Addresses" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <RequestErrorState error={error} onRetry={() => fetchAddresses()} />
      ) : (
        <>
          <FlatList
            data={addresses}
            keyExtractor={item => String(item.address_id)}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchAddresses(true)}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyText}>You have not added any addresses yet.</AppText>
              </View>
            }
            renderItem={({ item }) => (
              <AddressCard
                address={item}
                showActions
                onEdit={() => handleEdit(item)}
                onDelete={() => setDeleteTarget(item)}
              />
            )}
          />

          <View style={styles.bottomBar}>
            <Button onPress={() => navigation.navigate('AddAddress')}>Add Address</Button>
          </View>
        </>
      )}

      <ConfirmDialog
        visible={Boolean(deleteTarget)}
        title="Delete address?"
        message={
          deleteTarget
            ? `Remove the address for ${formatAddressName(deleteTarget)}?`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </View>
  );
};

const createStyles = colors => ({
  container: {
    flex: 1,
    backgroundColor: colors.homeBody,
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
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.secondaryText,
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

export default AddressListScreen;
