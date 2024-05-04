import { configureStore } from "@reduxjs.toolkit";

import provider from "./reducers/provider";
import nft from "./reducers/nft";

export const store = configureStore({
  reducer: { provider, nft },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
