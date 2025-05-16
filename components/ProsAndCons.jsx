import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

const ProsAndCons = ({ data, headerTitle }) => {
    // console.log('data', data);
    const [activeTab, setActiveTab] = useState('pros');
    if (!data || (!data.pros && !data.cons)) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Pros & Cons of Mahindra Scorpio N</Text>
                <Text style={styles.loadingText}>Loading pros and cons...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {headerTitle && (
                <Text style={styles.title}>
                    {headerTitle}
                </Text>
            )}
            {/* Tab Header */}
            <View style={styles.tabHeader}>
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => setActiveTab('pros')}
                    activeOpacity={0.8}
                >
                    <View style={styles.tabContent}>
                        <Text style={styles.icon}>👍</Text>
                        <Text style={[styles.tabText, activeTab === 'pros' && styles.activeTabText]}>
                            Things We Like
                        </Text>
                    </View>
                    {activeTab === 'pros' && <View style={styles.activeTabUnderline} />}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => setActiveTab('cons')}
                    activeOpacity={0.8}
                >
                    <View style={styles.tabContent}>
                        <Text style={styles.icon}>👎</Text>
                        <Text style={[styles.tabText, activeTab === 'cons' && styles.activeTabText]}>
                            Things We Don't Like
                        </Text>
                    </View>
                    {activeTab === 'cons' && <View style={styles.activeTabUnderline} />}
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={[styles.contentArea, activeTab === 'pros' ? styles.prosSection : styles.consSection]}>
                {activeTab === 'pros' ? (
                    data.pros && data.pros.length > 0 ? (
                        data.pros.map((pro, index) => (
                            <View key={index} style={styles.item}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.itemText}>{pro}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.itemText}>No pros available</Text>
                    )
                ) : (
                    data.cons && data.cons.length > 0 ? (
                        data.cons.map((con, index) => (
                            <View key={index} style={styles.item}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.itemText}>{con}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.itemText}>No cons available</Text>
                    )
                )}

            </View>
        </View>
    );
};

export default ProsAndCons;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937', // text-gray-800
        marginBottom: 16,
    },
    tabHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937', // text-gray-800
    },
    activeTabText: {
        color: '#F97316', // text-orange-500
    },
    activeTabUnderline: {
        height: 2,
        backgroundColor: '#F97316', // bg-orange-500
        width: '80%',
        marginTop: 4,
    },
    contentArea: {
        padding: 12,
        borderRadius: 8,
    },
    prosSection: {
        backgroundColor: '#E6F4EA', // Light green background
    },
    consSection: {
        backgroundColor: '#FEE2E2', // Light red background
    },
    item: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 14,
        color: '#4B5563', // text-gray-600
        marginRight: 8,
    },
    itemText: {
        fontSize: 14,
        color: '#4B5563', // text-gray-600
        flex: 1,
        lineHeight: 20,
    },
    viewMore: {
        fontSize: 12,
        fontWeight: '500',
        color: '#2563EB', // text-blue-600
        marginTop: 8,
    },
    loadingText: {
        fontSize: 14,
        color: '#4B5563', // text-gray-600
        textAlign: 'center',
    },
});