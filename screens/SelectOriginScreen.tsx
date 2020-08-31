import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { location } from './types';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import MapView, { MapEvent, Marker } from 'react-native-maps';
import { aubergineMapStyle } from '../constants/MapStyles';
import { Icon, Button } from 'react-native-elements'
import { MapNavigationProp } from '../types';

interface SelectOriginScreenProps {
  navigation: MapNavigationProp<'Origin'>
}

export const SelectOriginScreen: React.FC<SelectOriginScreenProps> = ({ navigation }) => {
  const [origin, setOrigin] = useState<location>();
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    setOriginLocation();
  }, []);

  const verifyPermissions = async () => {
    const result = await Permissions.askAsync(Permissions.LOCATION);
    if (result.status !== 'granted') {
      Alert.alert('Insufficient permissions', 'You need to grant location permissions to use this feature.',
        [{ text: 'OK' }]);
      return false;
    }
    return true;
  }

  const setOriginLocation = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;
    try {
      setIsLoading(true);
      const locationResult = await Location.getCurrentPositionAsync({
        timeout: 7000,
      });
      setOrigin({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      })
      setIsLoading(false);
    } catch (err) {
      Alert.alert(
        'Could not fetch location',
        'Please try again or pick a location on the map.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  };

  const navToCurrentLocation = useCallback(async (
    latitude: number,
    longitude: number
  ) => {
    if (mapRef.current && origin) {

      mapRef.current.animateCamera({
        center: {
          longitude,
          latitude
        },
        zoom: 15
      }, {
        duration: 2000
      });
    }
  }, [origin]);

  const getCurrentLocation = async () => {
    const locationResult = await Location.getCurrentPositionAsync({
      timeout: 7000,
    });
    return {
      latitude: locationResult.coords.latitude,
      longitude: locationResult.coords.longitude,
    }
  }

  const selectDestination = useCallback(() => {
    if (!origin) return;
    navigation.navigate('Destination', {
      originCoords: {
        latitude: origin.latitude,
        longitude: origin.longitude
      }
    })
  }, [origin]);

  return (
    <View style={{ flex: 1 }}>
      {origin &&
        <MapView
          style={{ flex: 1 }}
          initialRegion={origin}
          customMapStyle={aubergineMapStyle}
          ref={mapRef}
          showsUserLocation
          loadingBackgroundColor='#1d2c4d'
          // onRegionChangeComplete={region => Alert.alert('Region changed', `latitude is ${region.latitude}, longitude is ${region.longitude}`)}
          onRegionChange={region => setOrigin(region)}
        >
          <Marker coordinate={{
            latitude: origin.latitude,
            longitude: origin.longitude
          }}
            pinColor='palevioletred'
          />
        </MapView>
      }
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          position: 'absolute',
          bottom: 0,
          padding: 20,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button
          onPress={() => selectDestination()}
        title = 'Next'/>
        <Icon
          raised
          name='my-location'
          type='material-icon'
          color='#255763'
          onPress={() => getCurrentLocation().then(loc => {
            navToCurrentLocation(loc.latitude, loc.longitude);
          })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});