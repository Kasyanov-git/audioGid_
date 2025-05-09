import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface SubscriptionScreenProps {
    navigation: any;
  }

function SubscriptionScreen({ navigation }: SubscriptionScreenProps): React.JSX.Element {

    return (
        <>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.text}>GO BACK TO PROFILE</Text>
        </TouchableOpacity>
        <Text style={styles.text}>This is Subscription page</Text>
        </>
    )

}

const styles = StyleSheet.create ({
    text: {
        color: '#000',
    },
});

export default SubscriptionScreen;
