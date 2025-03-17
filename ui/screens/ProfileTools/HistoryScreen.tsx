import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface HistoryScreenProps {
    navigation: any;
  }

function HistoryScreen({ navigation }: HistoryScreenProps): React.JSX.Element {

    return (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.text}>GO BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.text}>This is user's History page</Text>
        </>
    )

}

const styles = StyleSheet.create ({
    text: {
        color: '#000',
    },
});

export default HistoryScreen;
