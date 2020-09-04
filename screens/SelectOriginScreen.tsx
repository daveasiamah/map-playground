import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { location } from './types';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import MapView, { MapEvent, Marker } from 'react-native-maps';
import { aubergineMapStyle } from '../constants/MapStyles';
import { Icon, Button, ListItem } from 'react-native-elements'
import { MapNavigationProp } from '../types';
import { MapSearchInputGroup, placesList as PlacesList } from '../components/map/MapSearchInputGroup';
import { GoogleApiKey } from '../constants/env';

interface SelectOriginScreenProps {
  navigation: MapNavigationProp<'Origin'>
}

export const SelectOriginScreen: React.FC<SelectOriginScreenProps> = ({ navigation }) => {
  const [origin, setOrigin] = useState<location>();
  const [destination, setDestination] = useState<location>();
  const [places, setPlaces] = useState<{
    type: 'origin' | 'destination',
    list: PlacesList
  }>();
  const mapRef = useRef<MapView>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOriginLocation();
  }, []);

  const getCoordinatesFromGeocode = async (addressUriComponent: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${addressUriComponent}&key=${GoogleApiKey}`
      const res= await fetch(url);
      const resJson = await res.json();
      const location = resJson.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  const setOriginFromPlace = useCallback(async (uriComponent: string) => {
    if (!origin) return;
    const location = await getCoordinatesFromGeocode(uriComponent);
    setOrigin({
      latitude: location!.latitude,
      longitude: location!.longitude,
      latitudeDelta: origin.latitudeDelta,
      longitudeDelta: origin.longitudeDelta
    });
    navToCurrentLocation(location!.latitude, location!.longitude);
    setPlaces(undefined);
  }, [origin]);
  
  const setDestinationFromPlace = useCallback(async (uriComponent: string) => {
    // if (!destination) return;
    const location = await getCoordinatesFromGeocode(uriComponent);
    setDestination({
      latitude: location!.latitude,
      longitude: location!.longitude,
      // I use origin's deltas because I have not set a default destination
      latitudeDelta: origin!.latitudeDelta,
      longitudeDelta: origin!.longitudeDelta
    });
    console.log(location)
    navToCurrentLocation(location!.latitude, location!.longitude);
    setPlaces(undefined);
  }, [destination]);

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
    <>
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
            title='Next' />
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
      <View style={{
        position: 'absolute',
        top: 0,
        width: '100%'
      }}>
        <MapSearchInputGroup
          onNewDestinationPlacesList={
            (placesList) => setPlaces(
              { type: 'destination', list: placesList }
            )
          }
          onNewOriginPlacesList={
            (placesList) => setPlaces(
              { type: 'origin', list: placesList }
            )
          }
        />
        {places && <View>
          {places.list.descriptions.map((desc, idx) => <ListItem
            key={desc}
            title={desc}
            onPress={() => {
              if (places.type === 'origin' ) setOriginFromPlace(places.list.uriComponents[idx]);
              else if (places.type === 'destination') setDestinationFromPlace(places.list.uriComponents[idx]);
            }}
            bottomDivider
          />)}
        </View>}
      </View>
    </>
  );
};

const styles = StyleSheet.create({});