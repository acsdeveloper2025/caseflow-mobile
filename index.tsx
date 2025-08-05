import 'nativewind/style';
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';

const appName = 'CaseFlowMobile';

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
