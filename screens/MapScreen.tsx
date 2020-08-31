import * as React from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import MapView, { Marker, MapEvent, Polyline } from "react-native-maps";
import { decode } from '@mapbox/polyline';

import { Text, View } from '../components/Themed';
import { darkMapStyles } from '../constants/MapStyles';
import { GoogleApiKey } from '../constants/env';

export default function MapScreen() {
  const [origin, setOrigin] = React.useState<{
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number
  }>();
  const [destination, setDestination] = React.useState<{
    latitude: number,
    longitude: number,
  }>();
  const [isLoading, setIsLoading] = React.useState(false);
  const mapRef = React.useRef<MapView>(null);

  React.useEffect(() => {
    async function verifyPermissions() {
      const result = await Permissions.askAsync(Permissions.LOCATION);
      if (result.status !== 'granted') {
        Alert.alert('Insufficient permissions', 'You need to grant location permissions to use this feature.',
          [{ text: 'OK' }]);
        return false;
      }
      return true;
    }

    async function getCurrentLocation() {
      try {
        const hasPermission = await verifyPermissions();
        if (!hasPermission) return;

        setIsLoading(true);

        const locationResult = await Location.getCurrentPositionAsync({
          timeout: 7000,
        });

        setOrigin({
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        });

        setIsLoading(false);
      } catch (err) {
        Alert.alert(
          'Could not fetch location',
          'Please try again or pick a location on the map.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
      }
    }
    getCurrentLocation();
  }, []);

  // React.useEffect(() => {
  //   if (mapRef.current) {
  //     console.log('zooming')
  //     mapRef.current.animateCamera(
  //       {
  //         center: {
  //           latitude: 50.1109221,
  //           longitude: 8.6821267
  //         },
  //         zoom: 15
  //       },
  //       {
  //         duration: 5000
  //       }
  //     );
  //   }
  // }, []);

  const getDirections = async (origin: any, destinationLoc: any) => {
    try {
      const KEY = "YOUR GOOGLE API KEY";
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GoogleApiKey}`
      );
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
        'Could not fetch directions',
        'Please try again or pick a directions on the map.',
        [{ text: 'OK' }]
    }
  }

  const destinationSelected = (ev: MapEvent) => {
    const coords = ev.nativeEvent.coordinate;
    setDestination({
      latitude: coords.latitude,
      longitude: coords.longitude,
    })
  }


  return (
    <>
      {origin && <MapView
        style={{ flex: 1 }}
        initialRegion={origin}
        customMapStyle={darkMapStyles}
        ref={mapRef}
        onPress={destinationSelected}
      // onRegionChangeComplete={region => setOrigin(region)}
      >
        <Marker coordinate={{
          latitude: origin.latitude,
          longitude: origin.longitude
        }}
          pinColor='palevioletred'
        />
        {destination &&
          <Marker
            draggable={true}
            onDragEnd={destinationSelected}
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude
            }}
            pinColor='aqua'
          />}
        {origin && destination &&
          <Polyline coordinates={[
            { latitude: origin.latitude, longitude: origin.longitude },
            { latitude: destination.latitude, longitude: destination.longitude }
          ]}
            strokeColor='gold'
            strokeWidth={6}
          />
        }
      </MapView>}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
