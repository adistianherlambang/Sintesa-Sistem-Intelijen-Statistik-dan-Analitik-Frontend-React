import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { kanvaStore, kanvaPersistor } from '../../../kanva/store/editorStore';
import KanvaEditor from '../../../kanva/KanvaEditor';

export default function BuatInfografis() {
  return (
    <Provider store={kanvaStore}>
      <PersistGate loading={null} persistor={kanvaPersistor}>
        <KanvaEditor />
      </PersistGate>
    </Provider>
  );
}
