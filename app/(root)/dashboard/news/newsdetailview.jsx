import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const NewsDetailView = () => {
    const { article } = useLocalSearchParams();
    const router = useRouter();

    // Parse the article data from the query parameter
    const articleData = article ? JSON.parse(article) : null;

    if (!articleData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Article not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            {articleData.image && (
                <Image
                    source={{ uri: articleData.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}
            <Text style={styles.title}>{articleData.title}</Text>
            <Text style={styles.date}>{articleData.date}</Text>
            <Text style={styles.description}>{articleData.description}</Text>
            {articleData.blogpost && (
                <HTML
                    source={{ html: articleData.blogpost }}
                    contentWidth={width - 40} // Adjust for padding
                    tagsStyles={{
                        p: { fontSize: 16, color: '#333', lineHeight: 24, marginVertical: 5 },
                        strong: { fontWeight: '700' },
                    }}
                    baseStyle={{
                        fontSize: 16,
                        color: '#333',
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f7fa',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    backText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 5,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 15,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#d32f2f',
        textAlign: 'center',
    },
});

export default NewsDetailView;