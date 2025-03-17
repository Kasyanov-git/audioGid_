import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SettingsScreenProps {
    navigation: any;
  }

function SettingsScreen({ navigation }: SettingsScreenProps): React.JSX.Element {

    return (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.text}>GO BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.text}>This is Settings page</Text>
        </>
    )

}

const styles = StyleSheet.create ({
    text: {
        color: '#000',
    },
});

export default SettingsScreen;
