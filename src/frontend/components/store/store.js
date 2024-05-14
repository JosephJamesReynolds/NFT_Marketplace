import { configureStore } from "@reduxjs/toolkit";

import provider from "./reducers/provider";
import nft from "./reducers/nft";
import marketplace from "./reducers/marketplace";

export const store = configureStore({
  reducer: { provider, nft, marketplace },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
