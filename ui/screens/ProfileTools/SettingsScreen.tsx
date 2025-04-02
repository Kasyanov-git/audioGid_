import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Pressable } from "react-native";
import { theme } from "../../../theme";
import ChevronLeft from '../../../assets/images/icons/chevron-left.svg';
import { useState } from "react";

interface SettingsScreenProps {
    navigation: any;
}

type ThemeType = 'system' | 'light' | 'dark';

function SettingsScreen({ navigation }: SettingsScreenProps): React.JSX.Element {

    const [selectedTheme, setSelectedTheme] = useState<ThemeType>('system');

    return (
        <>
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft width={24} height={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Настройки</Text>
            </View>
            <ScrollView style={styles.contentContainer}>
                <View style={styles.themeContainer}>
                    <Text style={styles.themeTitle}>Тема оформления</Text>
                    <View style={styles.chooseThemeContainer}>
                        <Pressable 
                            style={[
                                styles.themeOptionContainer,
                                selectedTheme === 'system' && styles.themeOptionSelected
                            ]} 
                            onPress={() => setSelectedTheme('system')}
                        >
                            <Text style={styles.themeOptionTitle}>Системная</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={[
                                styles.themeOptionContainer,
                                selectedTheme === 'light' && styles.themeOptionSelected
                            ]} 
                            onPress={() => setSelectedTheme('light')}
                        >
                            <Text style={styles.themeOptionTitle}>Светлая</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={[
                                styles.themeOptionContainer,
                                selectedTheme === 'dark' && styles.themeOptionSelected
                            ]} 
                            onPress={() => setSelectedTheme('dark')}
                        >
                            <Text style={styles.themeOptionTitle}>Темная</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
        </>
    )

}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
      },
      header: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#EEEEEE',
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    contentContainer: {
        flexDirection: 'column',
        padding: 16,
    },
    themeContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    themeTitle: {
        fontSize: 20,
        color: theme.colors.text,
    },
    chooseThemeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    themeOptionContainer: {
        backgroundColor: theme.colors.background,
        padding: 8,
        borderRadius: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    themeOptionSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    themeOptionTitle: {
        fontSize: 14,
        color: theme.colors.text,
    },
});

export default SettingsScreen;
