import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "../reducers/rootReducer";
import combinedMiddlewares from "../middlewares";

const persistConfig = {
  key: "root-v2",
  storage,
  whitelist: ["auth"],
  version: 2,
  migrate: (state) => Promise.resolve(state ? { ...state, token: undefined, api: undefined } : state),
};

// Remove the legacy persisted tree because it may contain credentials and unrelated Redux slices.
void storage.removeItem("persist:root");

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore blob responses in API mutations
        ignoredPaths: ["api.mutations"],
        ignoredActionPaths: ["payload.data"],
      },
    }).concat(combinedMiddlewares),
  devTools: import.meta.env.MODE !== "production",
});

export const persistor = persistStore(store);

export default store;
