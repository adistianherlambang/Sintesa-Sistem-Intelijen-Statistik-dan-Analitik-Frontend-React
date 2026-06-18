import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './editorReducer';

// Use separate key 'kanva-editor' so it doesn't conflict with any other localStorage
const persistConfig = {
    key: 'kanva-editor',
    storage,
};

const persistedReducer = persistReducer(persistConfig, editorReducer);

export const kanvaStore = configureStore({
    reducer: {
        editor: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const kanvaPersistor = persistStore(kanvaStore);
