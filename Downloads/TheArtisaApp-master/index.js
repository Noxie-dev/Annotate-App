import { registerRootComponent } from 'expo';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app component as the main component
if (module.hot) {
  module.hot.accept();
}

AppRegistry.registerComponent('main', () => App);

// Register the app for web
if (typeof document !== 'undefined') {
  const root = createRoot(document.getElementById('root') ?? document.getElementById('main'));
  const RootApp = AppRegistry.getRunnable('main').component;
  root.render(<RootApp />);
}

// Register the app for Expo
registerRootComponent(App);
