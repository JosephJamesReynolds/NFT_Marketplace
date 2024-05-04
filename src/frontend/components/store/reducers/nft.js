import { createSlice } from "@reduxjs/toolkit";

export const nft = createSlice({
  name: "nft",
  initialState: { contracts: [] },
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },
  },
});

export const { setContracts } = nft.actions;

export default nft.reducer;
// Path: src/frontend/components/store/reducers/nft.js
