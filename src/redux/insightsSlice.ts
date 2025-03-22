import {createSlice} from '@reduxjs/toolkit';

const insightsSlice = createSlice({
  name: 'insights',
  initialState: [],
  reducers: {
    setInsights: (_, action) => action.payload.insights,
  },
});

export const {setInsights} = insightsSlice.actions;
export default insightsSlice.reducer;
