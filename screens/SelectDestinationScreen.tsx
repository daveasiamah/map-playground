import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { location } from './types';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { MapNavigationProp, MapRouteProp } from '../types';
import { aubergineMapStyle } from '../constants/MapStyles';
import { Button, Icon } from 'react-native-elements';
import { decode } from '@mapbox/polyline';
import { GoogleApiKey } from '../constants/env';


interface SelectDestinationScreenProps {
  navigation: MapNavigationProp<'Destination'>,
  route: MapRouteProp<'Destination'>
}

export const SelectDestinationScreen: React.FC<SelectDestinationScreenProps> = ({ navigation, route }) => {
  const [destination, setDestination] = useState<location>();
  const [polyLineCoords, setPolyLineCoords] = useState<{
    latitude: number;
    longitude: number;
  }[]>();
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    setDestinationLocation();
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

  const setDestinationLocation = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;
    try {
      setIsLoading(true);
      const locationResult = await Location.getCurrentPositionAsync({
        timeout: 7000,
      });
      setDestination({
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
    if (mapRef.current && destination) {

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
  }, [destination]);

  const getCurrentLocation = async () => {
    const locationResult = await Location.getCurrentPositionAsync({
      timeout: 7000,
    });
    return {
      latitude: locationResult.coords.latitude,
      longitude: locationResult.coords.longitude,
    }
  }

  const generatePolylineCoords = useCallback(async () => {
    if (!destination) return;
    if (!route.params.originCoords) return;
    const origin =  route.params.originCoords;
    const coords = await getDirections(
      { latitude: origin.latitude, longitude: origin.longitude },
      { latitude: destination.latitude, longitude: destination.longitude }
    );
    setPolyLineCoords(coords);
  }, [destination]);

  const getDirections = async (origin: { latitude: number, longitude: number }, destination: { latitude: number, longitude: number }) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GoogleApiKey}`;
      let resp = await fetch(url);

      let respJson = await resp.json();
      let points = decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {

        return {
          latitude: point[0],
          longitude: point[1]
        };
      });
      return coords;
    } catch (error) {
      Alert.alert(
        'Unable to generate route to location',
        'Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {destination &&
        <MapView
          style={{ flex: 1 }}
          initialRegion={destination}
          customMapStyle={aubergineMapStyle}
          ref={mapRef}
          showsUserLocation
          loadingBackgroundColor='#1d2c4d'
          onRegionChangeComplete={region => generatePolylineCoords()}
          onRegionChange={region => setDestination(region)}
        >
          {route.params.originCoords && <Marker coordinate={{
            latitude: route.params.originCoords.latitude,
            longitude: route.params.originCoords.longitude
          }}
            pinColor='palevioletred'
          />}
          <Marker coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude
          }}
            pinColor='aqua'
          />
          {polyLineCoords &&
            <Polyline coordinates={polyLineCoords}
              strokeColor='gold'
              strokeWidth={3}
            />
          }
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
          onPress={() => generatePolylineCoords()}
          title='Submit' />
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