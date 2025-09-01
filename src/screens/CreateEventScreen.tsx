import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { EventForm } from '../components/EventForm';
import { Event } from '../types';
import { AppDispatch } from '../store/store';
import { createEvent } from '../store/slices/eventsSlice';

type CreateEventScreenRouteProp = RouteProp<{
  CreateEvent: { date?: string };
}, 'CreateEvent'>;

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CreateEventScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const initialDate = route.params?.date;

  const handleSave = async (eventData: Partial<Event>) => {
    try {
      setIsLoading(true);
      await dispatch(createEvent(eventData)).unwrap();
      
      Alert.alert(
        'Success',
        'Event created successfully!',
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
        error.message || 'Failed to create event. Please try again.'
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
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
        initialDate={initialDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});