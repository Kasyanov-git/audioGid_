import React, { useState, useEffect } from 'react';
import { StyleSheet, PermissionsAndroid, Platform, View, SafeAreaView, Text } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { YaMap, Marker } from 'react-native-yamap';

YaMap.init('b8022cf4-d327-4c28-aa94-7174b69d808f');

function Map(): React.JSX.Element {
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Доступ к геолокации',
          message: 'Приложение требует доступа к вашей геолокации для отображения на карте',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Отмена',
          buttonPositive: 'ОК',
        }
      );
      console.log('Разрешение на геолокацию:', granted);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Доступ к геолокации отклонён');
        return;
      }
    }

    console.log('Разрешение получено, начинаем отслеживать...');

    Geolocation.watchPosition(
      (position) => {
        console.log('Геопозиция получена:', position);
        setCurrentPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
      }
    );
  };

  if (!currentPosition) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <YaMap
        showUserPosition={true}
        rotateGesturesEnabled={false}
        nightMode={false}
        initialRegion={{
          lat: currentPosition?.lat,
          lon: currentPosition?.lon,
          zoom: 15,
          azimuth: 0,
        }}
        style={styles.map}
      >
        {currentPosition && (
          <Marker
            point={{
              lat: currentPosition.lat,
              lon: currentPosition.lon,
            }}
            scale={8}
          />
        )}
      </YaMap>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  map: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default Map;
