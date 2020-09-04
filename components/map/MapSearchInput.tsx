import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface MapSearchInputProps {
  googleApiKey: string;
  onChangeText: Function;
  placeholder: string;
}

export const MapSearchInput = React.forwardRef((
  { googleApiKey, onChangeText, placeholder }: MapSearchInputProps,
  ref: string | ((instance: GooglePlacesAutocomplete | null) => void) | React.RefObject<GooglePlacesAutocomplete> | null | undefined
) => {

  return (
    <GooglePlacesAutocomplete
      ref={ref}
      placeholder={placeholder}
      fetchDetails
      textInputProps={{
        onChangeText: () => onChangeText()
      }}
      query={{
        key: googleApiKey,
        language: 'en',
        components: 'country:gh',
      }}
      styles={{
        container: {
          backgroundColor: 'aqua',
          width: '100%',
          position: 'absolute'
        },
      }}
      style={{
        backgroundColor: 'white',
        display: 'none'
      }}
    />
  );
})
