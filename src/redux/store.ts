import {configureStore} from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import menstruationReducer from './menstruationSlice';
import insightReducer from './insightsSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    menstruation: menstruationReducer,
    insights: insightReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
