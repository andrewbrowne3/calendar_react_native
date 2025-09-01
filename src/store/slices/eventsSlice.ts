import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Event } from '../../types';
import apiService from '../../services/api';

interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params: { startDate?: string; endDate?: string; calendarId?: string } = {}, { rejectWithValue }) => {
    try {
      console.log('📆 Redux: Fetching events with params:', params);
      const events = await apiService.getEvents(params.startDate, params.endDate, params.calendarId);
      console.log(`✅ Redux: Loaded ${events.length} events`);
      return events;
    } catch (error: any) {
      console.error('❌ Redux: Failed to fetch events:', error.message);
      return rejectWithValue(error.message || 'Failed to fetch events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Partial<Event>, { rejectWithValue }) => {
    try {
      console.log('➕ Redux: Creating event:', eventData.title);
      const newEvent = await apiService.createEvent(eventData);
      console.log('✅ Redux: Event created:', newEvent.title);
      return newEvent;
    } catch (error: any) {
      console.error('❌ Redux: Failed to create event:', error.message);
      return rejectWithValue(error.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, updates }: { eventId: string; updates: Partial<Event> }, { rejectWithValue }) => {
    try {
      console.log('✏️ Redux: Updating event:', eventId);
      const updatedEvent = await apiService.updateEvent(eventId, updates);
      console.log('✅ Redux: Event updated:', updatedEvent.title);
      return updatedEvent;
    } catch (error: any) {
      console.error('❌ Redux: Failed to update event:', error.message);
      return rejectWithValue(error.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      console.log('🗑️ Redux: Deleting event:', eventId);
      await apiService.deleteEvent(eventId);
      console.log('✅ Redux: Event deleted');
      return eventId;
    } catch (error: any) {
      console.error('❌ Redux: Failed to delete event:', error.message);
      return rejectWithValue(error.message || 'Failed to delete event');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.push(action.payload);
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;