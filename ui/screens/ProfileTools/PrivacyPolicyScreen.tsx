import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface PrivacyPolicyScreenProps {
    navigation: any;
  }

function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps): React.JSX.Element {

    return (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.text}>GO BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.text}>This is Privacy Policy page page</Text>
        </>
    )

}

const styles = StyleSheet.create ({
    text: {
        color: '#000',
    },
});

export default PrivacyPolicyScreen;
