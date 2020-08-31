import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MapStackParamList } from '../types';
import { SelectOriginScreen } from '../screens/SelectOriginScreen';
import { SelectDestinationScreen } from '../screens/SelectDestinationScreen';

interface MapStackNavigatorProps {

}

const Stack = createStackNavigator<MapStackParamList>();

export const MapStackNavigator: React.FC<MapStackNavigatorProps> = ({ }) => {

  return (
    <Stack.Navigator
      initialRouteName='Origin'
    >
      <Stack.Screen
        name='Origin'
        options={{
          headerTitle: 'Select Origin'
        }}
        component={SelectOriginScreen}
      />
      <Stack.Screen
        name='Destination'
        options={{
          headerTitle: 'Select Destination'
        }}
        component={SelectDestinationScreen}
      />
    </Stack.Navigator>
  );
}