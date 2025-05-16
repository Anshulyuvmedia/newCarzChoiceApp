import { StyleSheet, Text, View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CarFaq = ({ data, headerTitle }) => {
    const [expandedId, setExpandedId] = useState(null);

    // console.log('data', data);
    // Configure LayoutAnimation for smooth transitions
    const configureAnimation = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
            },
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
            },
        });
    };

    const toggleExpand = (id) => {
        configureAnimation();
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={styles.container}>
            {headerTitle && (
                <Text style={styles.headerTitle}>{headerTitle}</Text>
            )}
            {data && data.length > 0 ? (
                data.map((item) => (
                    <View key={item.id} style={styles.faqCard}>
                        <TouchableOpacity
                            style={styles.faqHeader}
                            onPress={() => toggleExpand(item.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.faqLabel}>{item.faqlabel}</Text>
                            <Feather
                                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#4B5563"
                            />
                        </TouchableOpacity>
                        {expandedId === item.id && (
                            <View style={styles.faqContent}>
                                <Text style={styles.faqValue}>{item.faqvalue}</Text>
                            </View>
                        )}
                    </View>
                ))
            ) : (
                <Text style={styles.noDataText}>No FAQs available</Text>
            )}
        </View>
    );
};

export default CarFaq;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F5F5F5', // Light gray background
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937', // text-gray-800
        marginBottom: 16,
    },
    faqCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    faqLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937', // text-gray-800
        flex: 1,
    },
    faqContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    faqValue: {
        fontSize: 14,
        color: '#4B5563', // text-gray-600
        lineHeight: 20,
    },
    noDataText: {
        fontSize: 14,
        color: '#4B5563', // text-gray-600
        textAlign: 'center',
    },
});