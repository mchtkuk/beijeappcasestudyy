import {createSlice} from '@reduxjs/toolkit';

const menstruationSlice = createSlice({
  name: 'menstruation',
  initialState: null,
  reducers: {
    setMenstruationDays: (_, action) => action.payload,
  },
});

export const {setMenstruationDays} = menstruationSlice.actions;
export default menstruationSlice.reducer;
