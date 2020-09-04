import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapSearchInput } from './MapSearchInput';
import { GoogleApiKey } from '../../constants/env';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { debounce } from 'underscore';

export type placesList = {
  descriptions: string[],
  uriComponents: string[]
}
type onPlacesListFn = ({ descriptions, uriComponents }: placesList) => any;
interface MapSearchInputGroupProps {
  onNewOriginPlacesList: onPlacesListFn,
  onNewDestinationPlacesList: onPlacesListFn
}

export const MapSearchInputGroup: React.FC<MapSearchInputGroupProps> = ({ onNewOriginPlacesList, onNewDestinationPlacesList }) => {
  const [originPlacesList, setOriginPlacesList] = useState<string[]>([]);
  const originRef = useRef<GooglePlacesAutocomplete>(null);
  const debouncedOnChangeOriginText = useRef(debounce(() => {
    const originPlaceState = originRef.current?.state as any;
    const originPlaces = originPlaceState?.dataSource?.map((place: any) => place?.description);
    setOriginPlacesList(originPlaces);
  }, 600)).current;

  const [destinationPlacesList, setDestinationPlacesList] = useState<string[]>([]);
  const destinationRef = useRef<GooglePlacesAutocomplete>(null);
  const debouncedOnChangeDestinationText = useRef(debounce(() => {
    const destinationPlaceState = destinationRef.current?.state as any;
    const destinationPlaces = destinationPlaceState?.dataSource?.map((place: any) => place?.description);
    setDestinationPlacesList(destinationPlaces);
  }, 600)).current;

  useEffect(() => {
    if (originPlacesList.length) {
      onNewOriginPlacesList({
        descriptions: originPlacesList,
        uriComponents: originPlacesList.map(place => encodeURIComponent(place))
      })
    }
  }, [originPlacesList]);

  useEffect(() => {
    if (destinationPlacesList.length) {
      console.log(destinationPlacesList)
      onNewDestinationPlacesList({
        descriptions: destinationPlacesList,
        uriComponents: destinationPlacesList.map(place => encodeURIComponent(place))
      })
    }
  }, [destinationPlacesList]);

  return (
    <>
      <View style={{
        width: '100%',
        height: 44
      }}>
        <MapSearchInput
          placeholder='Current Location'
          ref={originRef}
          googleApiKey={GoogleApiKey}
          onChangeText={() => debouncedOnChangeOriginText()}
        />
      </View>
      <View style={{
        width: '100%',
        height: 44
      }}>
        <MapSearchInput
          placeholder='Destination'
          ref={destinationRef}
          googleApiKey={GoogleApiKey}
          onChangeText={() => debouncedOnChangeDestinationText()}
        />
      </View>
    </>
  );
};
