import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const UserTypeToggle = ({ isUser, setIsUser, setOtpVerified }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => {
                    setIsUser(true);
                    setOtpVerified(false);
                }}
            >
                <View
                    style={[
                        styles.tab,
                        isUser ? styles.activeTab : styles.inactiveTab,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            isUser ? styles.activeText : styles.inactiveText,
                        ]}
                    >
                        User
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    setIsUser(false);
                    setOtpVerified(false);
                }}
            >
                <View
                    style={[
                        styles.tab,
                        !isUser ? styles.activeTab : styles.inactiveTab,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            !isUser ? styles.activeText : styles.inactiveText,
                        ]}
                    >
                        Dealer
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
    },
    tab: {
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 25,
        minWidth: 120,
        alignItems: 'center',
    },
    activeTab: { backgroundColor: '#0061ff' },
    inactiveTab: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd' },
    tabText: { fontWeight: 'bold' },
    activeText: { color: 'white' },
    inactiveText: { color: 'black' },
});

export default UserTypeToggle;