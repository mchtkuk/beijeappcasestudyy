import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';

import SplashScreen from './src/screens/SplashScreen';
import CycleScreen from './src/screens/CycleScreen';

const Stack = createStackNavigator();

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="CycleScreen" component={CycleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

export default App;
