import React, { useState, useEffect } from 'react';
import { StyleSheet, PermissionsAndroid, Platform, View, SafeAreaView, Text } from 'react-native';
import Geolocation, { watchPosition } from 'react-native-geolocation-service';
import  { YaMap, Marker,Geocoder,Search } from 'react-native-yamap';
import axios from 'axios'

YaMap.init('b8022cf4-d327-4c28-aa94-7174b69d808f');
Geocoder.init('500f7015-58c8-477a-aa0c-556ea02c2d9e');

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
      // getGeoCoder()
      searchOrganizations()
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
  const searchOrganizations = async () => {
        try {
          console.log("xui");
          const response = await axios.get(`https://search-maps.yandex.ru/v1/?text=%D0%9F%D0%B0%D0%BC%D1%8F%D1%82%D0%BD%D0%B8%D0%BA%D0%B8&type=biz&lang=en_US&results=1&apikey=4a35a38e-ba40-4ca1-932a-357b7b3c1ddb`);
          console.log("nexui");
          console.log(response.data.features);
        } catch (error) {
          console.error(error);
        }
      };
  const getGeoCoder= async ()=>{
    console.log(currentPosition)
    if(currentPosition!=null){
      console.log("xui1")
      console.log(await Geocoder.geoToAddress({lat: 46.263531, lon: 33.529214}))
      console.log(await Search.searchText("Москва"))
    }
      
  }
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
