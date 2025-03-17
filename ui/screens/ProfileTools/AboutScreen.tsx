import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface AboutScreenProps {
    navigation: any;
  }

function AboutScreen({ navigation }: AboutScreenProps): React.JSX.Element {

    return (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.text}>GO BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.text}>This is About page</Text>
        </>
    )

}

const styles = StyleSheet.create ({
    text: {
        color: '#000',
    },
});

export default AboutScreen;
