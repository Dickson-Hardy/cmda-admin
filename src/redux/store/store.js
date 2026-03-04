import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "../reducers/rootReducer";
import combinedMiddlewares from "../middlewares";

const persistConfig = {
  key: "root",
  storage,
};

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
});

export const persistor = persistStore(store);

export default store;
