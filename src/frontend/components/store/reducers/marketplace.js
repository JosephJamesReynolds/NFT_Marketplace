import { createSlice } from "@reduxjs/toolkit";

export const marketplace = createSlice({
  name: "marketplace",
  initialState: {
    contract: null,
    itemCount: 0,
    items: [],
    creating: {
      isCreating: false,
      isSuccess: false,
      transactionHash: null,
    },
    buying: {
      isBuying: false,
      isSuccess: false,
      transactionHash: null,
    },
  },

  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    startCreating: (state) => {
      state.creating.isCreating = true;
      state.creating.isSuccess = false;
      state.creating.transactionHash = null;
    },
    createSuccess: (state, action) => {
      state.creating.isCreating = false;
      state.creating.isSuccess = true;
      state.creating.transactionHash = action.payload;
    },
    createFailure: (state) => {
      state.creating.isCreating = false;
      state.creating.isSuccess = false;
      state.creating.transactionHash = null;
    },
    startBuying: (state) => {
      state.buying.isBuying = true;
      state.buying.isSuccess = false;
      state.buying.transactionHash = null;
    },
    buySuccess: (state, action) => {
      state.buying.isBuying = false;
      state.buying.isSuccess = true;
      state.buying.transactionHash = action.payload;
    },
    buyFailure: (state) => {
      state.buying.isBuying = false;
      state.buying.isSuccess = false;
      state.buying.transactionHash = null;
    },
    itemsPurchasedLoaded: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const {
  setContract,
  startCreating,
  createSuccess,
  createFailure,
  startBuying,
  buySuccess,
  buyFailure,
  itemsPurchasedLoaded,
} = marketplace.actions;

export default marketplace.reducer;
