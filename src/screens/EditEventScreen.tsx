import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { EventForm } from '../components/EventForm';
import { Event } from '../types';
import { AppDispatch } from '../store/store';
import { updateEvent } from '../store/slices/eventsSlice';

type EditEventScreenRouteProp = RouteProp<{
  EditEvent: { event: Event };
}, 'EditEvent'>;

export const EditEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditEventScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const event = route.params?.event;

  if (!event) {
    Alert.alert('Error', 'Event not found');
    navigation.goBack();
    return null;
  }

  const handleSave = async (eventData: Partial<Event>) => {
    try {
      setIsLoading(true);
      await dispatch(updateEvent({ id: event.id, updates: eventData })).unwrap();
      
      Alert.alert(
        'Success',
        'Event updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update event. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <EventForm
        event={event}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});