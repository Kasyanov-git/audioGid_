import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface FavouritesScreenProps {
    navigation: any;
  }

function FavouritesScreen({ navigation }: FavouritesScreenProps): React.JSX.Element {

    return (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.text}>GO BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.text}>This is user's Favourites page</Text>
        </>
    )

}

const styles = StyleSheet.create ({
    text: {
        color: '#000',
    },
});

export default FavouritesScreen;
