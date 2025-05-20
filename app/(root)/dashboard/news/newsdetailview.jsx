import { StyleSheet, View, Text, Image, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, Share, Pressable } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import icons from '@/constants/icons';

const { width } = Dimensions.get('window');

/**
 * NewsDetailView Component: Displays the details of a news article, review, or video
 */
const NewsDetailView = () => {
    const { article } = useLocalSearchParams();
    const router = useRouter();
    const [imageLoading, setImageLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(false);

    // Parse the article data from the query parameter
    const articleData = article ? JSON.parse(article) : null;

    // Function to extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Function to share the article
    const handleShare = async () => {
        try {
            await Share.share({
                message: `${articleData.title}\n${articleData.description}\n${articleData.vurl || 'https://carzchoice.com'}`,
                url: articleData.vurl || 'https://carzchoice.com',
                title: articleData.title,
            });
        } catch (error) {
            console.error('Error sharing article:', error);
        }
    };

    if (!articleData) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#d32f2f', '#b71c1c']}
                    style={styles.errorContainer}
                >
                    <Ionicons name="warning-outline" size={40} color="#fff" />
                    <Text style={styles.errorText}>Article not found.</Text>
                </LinearGradient>
            </View>
        );
    }

    const youtubeId = articleData.vurl ? extractYouTubeId(articleData.vurl) : null;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0061ff', '#003087']}
                className="p-3 px-5 mb-4 flex-row items-center justify-between"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/80 p-2 rounded-lg"
                    accessibilityLabel="Go back"
                >
                    <Image source={icons.backArrow} className="w-6 h-6 tint-white" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleShare}
                    style={styles.shareButton}
                    accessibilityLabel="Share article"
                >
                    <LinearGradient
                        colors={['#ffffff', '#f0f0f0']}
                        style={styles.shareButtonGradient}
                    >
                        <Ionicons name="share-outline" size={24} color="#1a1a1a" />
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
            
            {articleData.image && (
                    <View style={styles.imageContainer}>
                        {imageLoading && (
                            <View style={styles.imagePlaceholder}>
                                <ActivityIndicator size="large" color="#0061ff" />
                            </View>
                        )}
                        <Image
                            source={{ uri: articleData.image }}
                            style={styles.image}
                            resizeMode="cover"
                            onLoad={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
                            style={styles.imageGradient}
                        />
                    </View>
                )
            }
            <Text style={styles.title}>{articleData.title}</Text>
            <Text style={styles.date}>{articleData.date}</Text>
            <Text style={styles.description}>{articleData.description}</Text>
            {youtubeId && (
                    <View style={styles.videoContainer}>
                        <YoutubePlayer
                            height={220}
                            videoId={youtubeId}
                            play={playingVideo}
                            onChangeState={(event) => {
                                if (event === 'playing') setPlayingVideo(true);
                                if (event === 'paused' || event === 'ended') setPlayingVideo(false);
                            }}
                        />
                    </View>
                )
            }
            {articleData.blogpost && (
                    <HTML
                        source={{ html: articleData.blogpost }}
                        contentWidth={width - 40}
                        tagsStyles={{
                            p: { fontSize: 16, color: '#1a1a1a', lineHeight: 24, marginVertical: 6, paddingHorizontal: 15 },
                            strong: { fontWeight: '700' },
                        }}
                        baseStyle={{
                            fontSize: 16,
                            color: '#1a1a1a',
                        }}
                    />
                )
            }
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Match AllNews background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    backButton: {
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    backText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 6,
    },
    shareButton: {
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shareButtonGradient: {
        padding: 8,
        borderRadius: 8,
    },
    imageContainer: {
        position: 'relative',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    imagePlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
    },
    image: {
        width: '100%',
        height: 240, // Increased height for better visibility
        borderRadius: 12,
    },
    imageGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1a1a1a',
        marginHorizontal: 15,
        marginBottom: 10,
    },
    date: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
        marginHorizontal: 15,
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        fontWeight: '400',
        color: '#555',
        lineHeight: 24,
        marginHorizontal: 15,
        marginBottom: 15,
    },
    videoContainer: {
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    errorContainer: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginVertical: 15,
    },
});

export default NewsDetailView;