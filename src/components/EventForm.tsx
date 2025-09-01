import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Event, Calendar } from '../types';
import { COLORS, FONT_SIZES } from '../constants/config';
import { RootState } from '../store/store';

interface EventFormProps {
  event?: Event;
  onSave: (eventData: Partial<Event>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialDate?: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSave,
  onCancel,
  isLoading = false,
  initialDate,
}) => {
  const { calendars } = useSelector((state: RootState) => state.calendars);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: initialDate || new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: initialDate || new Date().toISOString().split('T')[0],
    endTime: '10:00',
    allDay: false,
    calendarId: calendars.length > 0 ? calendars[0].id : '',
    status: 'confirmed',
    isPrivate: false,
  });

  const statuses = ['confirmed', 'tentative', 'cancelled'];

  useEffect(() => {
    if (event) {
      const startDateTime = new Date(event.start_time);
      const endDateTime = new Date(event.end_time);
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5),
        allDay: event.all_day,
        calendarId: event.calendar.id,
        status: event.status,
        isPrivate: event.is_private,
      });
    } else if (calendars.length > 0 && !formData.calendarId) {
      setFormData(prev => ({ ...prev, calendarId: calendars[0].id }));
    }
  }, [event, calendars]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your event');
      return;
    }

    if (!formData.calendarId) {
      Alert.alert('Error', 'Please select a calendar for your event');
      return;
    }

    const startDateTime = formData.allDay 
      ? `${formData.startDate}T00:00:00`
      : `${formData.startDate}T${formData.startTime}:00`;
    
    const endDateTime = formData.allDay
      ? `${formData.endDate}T23:59:59`
      : `${formData.endDate}T${formData.endTime}:00`;

    const eventData: any = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined,
      start_time: startDateTime,
      end_time: endDateTime,
      all_day: formData.allDay,
      calendar: formData.calendarId,  // Backend expects 'calendar' not 'calendar_id'
      status: formData.status as Event['status'],
      is_private: formData.isPrivate,
    };

    console.log('EventForm: Sending event data:', eventData);
    onSave(eventData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dropdownContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.dropdownOption,
              value === option && styles.selectedDropdownOption,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.dropdownOptionText,
                value === option && styles.selectedDropdownOptionText,
              ]}
            >
              {option.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCalendarSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Calendar *</Text>
      <View style={styles.dropdownContainer}>
        {calendars.map((calendar) => (
          <TouchableOpacity
            key={calendar.id}
            style={[
              styles.dropdownOption,
              formData.calendarId === calendar.id && styles.selectedDropdownOption,
            ]}
            onPress={() => updateFormData('calendarId', calendar.id)}
          >
            <View style={styles.calendarOptionContent}>
              <View
                style={[
                  styles.calendarColorDot,
                  { backgroundColor: calendar.color },
                ]}
              />
              <Text
                style={[
                  styles.dropdownOptionText,
                  formData.calendarId === calendar.id && styles.selectedDropdownOptionText,
                ]}
              >
                {calendar.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {event ? 'Edit Event' : 'Create Event'}
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            placeholder="Enter event title"
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Describe your event (optional)"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(value) => updateFormData('location', value)}
            placeholder="Event location (optional)"
            maxLength={200}
          />
        </View>

        {/* All Day Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>All Day</Text>
          <Switch
            value={formData.allDay}
            onValueChange={(value) => updateFormData('allDay', value)}
            trackColor={{ false: '#767577', true: COLORS.PRIMARY }}
            thumbColor={formData.allDay ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Start Date and Time */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.startDate}
            onChangeText={(value) => updateFormData('startDate', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {!formData.allDay && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Start Time *</Text>
            <TextInput
              style={styles.input}
              value={formData.startTime}
              onChangeText={(value) => updateFormData('startTime', value)}
              placeholder="HH:MM"
            />
          </View>
        )}

        {/* End Date and Time */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>End Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.endDate}
            onChangeText={(value) => updateFormData('endDate', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {!formData.allDay && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>End Time *</Text>
            <TextInput
              style={styles.input}
              value={formData.endTime}
              onChangeText={(value) => updateFormData('endTime', value)}
              placeholder="HH:MM"
            />
          </View>
        )}

        {/* Calendar Selection */}
        {renderCalendarSelector()}

        {/* Status */}
        {renderDropdown(
          'Status *',
          formData.status,
          statuses,
          (value) => updateFormData('status', value)
        )}

        {/* Private Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Private Event</Text>
          <Switch
            value={formData.isPrivate}
            onValueChange={(value) => updateFormData('isPrivate', value)}
            trackColor={{ false: '#767577', true: COLORS.PRIMARY }}
            thumbColor={formData.isPrivate ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BACKGROUND.SECONDARY,
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT.PRIMARY,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.TEXT.SECONDARY,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
    color: COLORS.TEXT.PRIMARY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND.SECONDARY,
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZES.MEDIUM,
    color: COLORS.TEXT.PRIMARY,
    backgroundColor: COLORS.BACKGROUND.PRIMARY,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND.SECONDARY,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedDropdownOption: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  dropdownOptionText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT.SECONDARY,
    fontWeight: '500',
  },
  selectedDropdownOptionText: {
    color: 'white',
  },
  calendarOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});