/**
 * @format
 */

import 'react-native-gesture-handler'; // Must be at the top
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
