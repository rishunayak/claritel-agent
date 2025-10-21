import { createSlice, createAction } from '@reduxjs/toolkit';
import { fetchAssistants, createAssistant, updateAssistant, deleteAssistant } from './assistantsActions';

// Action for updating assistant with phone number
export const updateAssistantWithPhoneNumber = createAction(
  'assistants/updateWithPhoneNumber',
  (assistantId, phoneNumber) => ({
    payload: { assistantId, phoneNumber }
  })
);

const initialState = {
  data: [],
  loading: false,
  error: null
};

const assistantsSlice = createSlice({
  name: 'assistants',
  initialState,
  reducers: {
    resetAssistantsState: (state) => {
      state.error = null;
    },
    clearAssistants: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assistants
      .addCase(fetchAssistants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssistants.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchAssistants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch assistants';
      })

      // Create assistant
      .addCase(createAssistant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssistant.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.loading = false;
      })
      .addCase(createAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create assistant';
      })

      // Update assistant
      .addCase(updateAssistant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssistant.fulfilled, (state, action) => {
        const index = state.data.findIndex(assistant => assistant.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update assistant';
      })

      // Delete assistant
      .addCase(deleteAssistant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssistant.fulfilled, (state, action) => {
        // Remove the deleted assistant from the state
        state.data = state.data.filter(assistant => assistant.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteAssistant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete assistant';
      })
      
      // Handle phone number update
      .addCase(updateAssistantWithPhoneNumber, (state, action) => {
        const { assistantId, phoneNumber } = action.payload;
        
        // Find the assistant and update it with the new phone number
        const assistantIndex = state.data.findIndex(assistant => assistant.id === assistantId);
        if (assistantIndex !== -1) {
          // Update the assistant with the new default phone number
          state.data[assistantIndex] = {
            ...state.data[assistantIndex],
            default_phone: phoneNumber
          };
        }
      });
  }
});

export const { resetAssistantsState, clearAssistants } = assistantsSlice.actions;
export default assistantsSlice.reducer;

