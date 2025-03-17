import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SupportScreenProps {
    navigation: any;
  }

function SupportScreen({ navigation }: SupportScreenProps): React.JSX.Element {

    return (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.text}>GO BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.text}>This is Support page</Text>
        </>
    )

}

const styles = StyleSheet.create ({
    text: {
        color: '#000',
    },
});

export default SupportScreen;
