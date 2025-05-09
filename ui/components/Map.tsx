import React, { useState, useEffect } from 'react';
import { StyleSheet, PermissionsAndroid, Platform, View, SafeAreaView, Text, Image } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { YaMap, Marker,CameraPosition } from 'react-native-yamap';
YaMap.init('b8022cf4-d327-4c28-aa94-7174b69d808f');

type Props = {
  onPositionChange: (pos: { lat: number; lon: number }) => void;
};
function Map({ onPositionChange }: Props): React.JSX.Element {
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lon: number } | null>(null);
  
  useEffect(() => {
    if (currentPosition) {
      onPositionChange(currentPosition); // Передаем данные в родителя
    }
  }, [currentPosition]);
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

      // searchOrganizations()
      console.log('Разрешение на геолокацию:', granted);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Доступ к геолокации отклонён');
        return;
      }
    }

    console.log('Разрешение получено, начинаем отслеживать...');
    YaMap
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
  // const searchOrganizations = async () => {
  //       try {
  //         const response = await axios.get(`https://search-maps.yandex.ru/v1/?text=%D0%9F%D0%B0%D0%BC%D1%8F%D1%82%D0%BD%D0%B8%D0%BA%D0%B8&type=biz&lang=en_US&results=1&apikey=4a35a38e-ba40-4ca1-932a-357b7b3c1ddb`);
  //         console.log(response.data.features);
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     };

  if (!currentPosition) {
    console.log(currentPosition);
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <YaMap
      onCameraPositionChange={(e: any) => {
        // Обновляем локальное состояние
        setCurrentPosition({
          lat: e.cameraPosition.point.lat,
          lon: e.cameraPosition.point.lon
        });
      }}
        showUserPosition={true}
        userLocationIcon={require('../../assets/images/icons/geoposition.png')}
        scrollGesturesEnabled={true}
        zoomGesturesEnabled={true}
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
            children={
              <Image
              source={require('../../assets/images/icons/geoposition.png')}
              style={styles.marker}
            />
            }
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
  marker: {
    width: 40,
    height: 40,
  },
});

export default Map;
