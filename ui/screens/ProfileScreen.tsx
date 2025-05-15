import React, { useState, useEffect } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LogoutButton from './Security/LogoutButton';
import EditIcon from '../../assets/images/icons/edit-icon.svg';
import AddPhotoIcon from '../../assets/images/icons/add-photo-icon.svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { ImageLibraryOptions } from 'react-native-image-picker';
import ChevronRight from '../../assets/images/icons/chevron-right-icon.svg';
import { theme } from '../../theme';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileScreenProps {
  navigation: any;
  onLogout: () => void;
}

interface CarouselItem {
  id: number;
  imageUrl: string;
}

function ProfileScreen({ navigation, onLogout }: ProfileScreenProps): React.JSX.Element {

  const [avatar, setAvatar] = useState<{ uri: string } | null>(null);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<{username: string; email: string} | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    loadUser();
  }, []);

  const carouselItems: CarouselItem[] = [
    { id: 1, imageUrl: 'https://cdn1.flamp.ru/5cfc249baad12b9824c7751ad357724a.jpg' },
    { id: 2, imageUrl: 'https://picture.portalbilet.ru/origin/b3b680c7-56bc-47d8-87f1-9f67a42398ae.jpeg' },
    { id: 3, imageUrl: 'https://nnao.ru/wp-content/uploads/2024/02/Chehov-1.jpg' },
  ];

  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 76,
      maxWidth: 76,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri! };
        setAvatar(source);
      }
    });
  };

  const renderCarouselItem = ({ item, index }: { item: CarouselItem; index: number }): React.ReactElement => {
    return (
      <View style={[styles.carouselItem, { zIndex: carouselItems.length - index }]}>
        <Image source={{ uri: item.imageUrl }} style={styles.carouselImage} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.safeAreaContainer} />
        <View style={styles.header}>
          <TouchableOpacity onPress={selectImage}>
            <View style={styles.photoContainer}>
              {avatar ? (
                <Image source={avatar} style={styles.avatar} />
              ) : (
                <AddPhotoIcon width={24} height={24} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.profileUsername}>{user?.username || 'Username'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'email'}</Text>
          <TouchableOpacity style={styles.editProfileContainer}>
            <EditIcon width={24} height={24}/>
            <Text style={styles.profileEditText}>Редактировать профиль</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentlyVisitedContainer}>
          <TouchableOpacity style={styles.recentlyVisitedTitleContainer}>
            <Text style={styles.recentlyVisitedTitle}>
              Недавно вы посещали
            </Text>
            <ChevronRight width={20} height={20} style={styles.recentlyChevronRight} />
          </TouchableOpacity>
          <View style={styles.recentlyVisitedCarouselContainer}>
            <Carousel
              data={carouselItems}
              renderItem={renderCarouselItem}
              sliderWidth={width}
              itemWidth={width - 60}
              layout={'default'}
              loop={true}
              autoplay={true}
              autoplayInterval={5000}
              onSnapToItem={(index) => setActiveSlide(index)}
              activeSlideAlignment={'start'}
              firstItem={0}
              // inactiveSlideOpacity={0}
            />
            <Pagination
              dotsLength={carouselItems.length}
              activeDotIndex={activeSlide}
              containerStyle={styles.paginationContainer}
              dotStyle={styles.paginationDot}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
          </View>
        </View>

        <View style={styles.toolsListContainer}>
          <TouchableOpacity style={styles.listItemFirstContainer} onPress={() => navigation.navigate('History')}>
            <Text style={styles.listItemText}>История</Text>
            <ChevronRight width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemContainer} onPress={() => navigation.navigate('Favourites')}>
            <Text style={styles.listItemText}>Избранное</Text>
            <ChevronRight width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemContainer} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.listItemText}>Настройки</Text>
            <ChevronRight width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemContainer} onPress={() => navigation.navigate('Subscription')}>
            <Text style={styles.listItemText}>Управление подпиской</Text>
            <ChevronRight width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemContainer} onPress={() => navigation.navigate('Support')}>
            <Text style={styles.listItemText}>Поддержка</Text>
            <ChevronRight width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemLastContainer} onPress={() => navigation.navigate('About')}>
            <Text style={styles.listItemText}>О приложении</Text>
            <ChevronRight width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemLastContainer} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.listItemText}>Политика конфиденциальности</Text>
            <ChevronRight width={20} height={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <LogoutButton navigation={navigation} onLogout={onLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  safeAreaContainer: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#F4F4F4',
    height: 44,
    width: '100%',
  },
  header: {
    backgroundColor: '#F4F4F4',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    height: 208,
    width: '100%',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  photoContainer: {
    width: 76,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileUsername: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: theme.colors.text,
    marginTop: 8,
  },
  profileEmail: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text2,
    marginTop: 4,
  },
  profileEditText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 40,
  },
  editProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  recentlyVisitedContainer: {
    marginLeft: 16,
    marginTop: 20,
    // marginRight: 16,
  },
  recentlyVisitedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentlyVisitedTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  recentlyChevronRight: {
    marginTop: 3,
  },
  recentlyVisitedCarouselContainer: {
    marginTop: 8,
  },
  carouselItem: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  paginationContainer: {
    paddingVertical: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  toolsListContainer: {
    width: 382,
    backgroundColor: '#F4F4F4',
    borderRadius: 20,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 20,
    paddingLeft: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  listItemFirstContainer: {
    borderBottomWidth: 1,
    borderColor: '#C3C3C3',
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingTop: 16,
  },
  listItemContainer: {
    borderBottomWidth: 1,
    borderColor: '#C3C3C3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  listItemLastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingBottom: 16,
    paddingTop: 16,
  },
  listItemText: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
  },
  bottomContainer: {
    flexDirection: 'column',
    alignContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default ProfileScreen;