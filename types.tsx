import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};

export type BottomTabParamList = {
  Map: undefined;
  TabTwo: undefined;
};

export type MapStackParamList = {
  Origin: undefined;
  Destination: {
    originCoords: {
      latitude: number,
      longitude: number,
    }
  };
};

export type MapNavigationProp<T extends keyof MapStackParamList> = StackNavigationProp<MapStackParamList, T>;
export type MapRouteProp<T extends keyof MapStackParamList> = RouteProp<MapStackParamList, T>; 


export type TabTwoParamList = {
  TabTwoScreen: undefined;
};
