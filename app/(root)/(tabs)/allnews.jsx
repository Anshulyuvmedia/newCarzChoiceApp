import * as React from 'react';
import { View, StyleSheet, Dimensions, FlatList, Image, Text, ActivityIndicator, TouchableOpacity, Modal, Pressable } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/**
 * CarNews Component: Displays a list of car news articles
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of car news items
 */
const CarNews = ({ data }) => {
    const router = useRouter();

    const renderNewsItem = ({ item }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.9}
            onPress={() => {
                router.push({
                    pathname: '/dashboard/news/newsdetailview',
                    params: { article: JSON.stringify(item) },
                });
            }}
        >
            <LinearGradient
                colors={['#ffffff', '#f9f9f9']}
                style={styles.cardGradient}
            >
                {item.image && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.newsImage}
                            resizeMode="fill"
                        />
                    </View>
                )}
                <View style={styles.newsContent}>
                    <Text style={styles.newsTitle} numberOfLines={2} ellipsizeMode="tail">
                        {item.title}
                    </Text>
                    <Text style={styles.newsDate}>{item.date}</Text>
                    <Text style={styles.newsDescription} numberOfLines={3} ellipsizeMode="tail">
                        {item.description}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.scene}>
            {data.length > 0 ? (
                <FlatList
                    data={data}
                    renderItem={renderNewsItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.newsList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.noDataText}>No Car News available.</Text>
            )}
        </View>
    );
};

/**
 * ExpertReviews Component: Displays a list of expert reviews
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of expert review items
 */
const ExpertReviews = ({ data }) => {
    const router = useRouter();

    const renderReviewItem = ({ item }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.9}
            onPress={() => {
                router.push({
                    pathname: '/dashboard/news/newsdetailview',
                    params: { article: JSON.stringify(item) },
                });
            }}
        >
            <LinearGradient
                colors={['#ffffff', '#f9f9f9']}
                style={styles.cardGradient}
            >
                {item.image && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.newsImage}
                            resizeMode="cover"
                        />
                    </View>
                )}
                <View style={styles.newsContent}>
                    <Text style={styles.newsTitle} numberOfLines={2} ellipsizeMode="tail">
                        {item.title}
                    </Text>
                    <Text style={styles.newsDate}>{item.date}</Text>
                    <Text style={styles.newsDescription} numberOfLines={3} ellipsizeMode="tail">
                        {item.description}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.scene}>
            {data.length > 0 ? (
                <FlatList
                    data={data}
                    renderItem={renderReviewItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.newsList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.noDataText}>No Expert Reviews available.</Text>
            )}
        </View>
    );
};

/**
 * Videos Component: Displays a list of video items with a playable modal
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of video items
 */
const Videos = ({ data }) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedVideo, setSelectedVideo] = React.useState(null);
    const [isYouTube, setIsYouTube] = React.useState(true);
    const [playing, setPlaying] = React.useState(false);
    const [videoLoading, setVideoLoading] = React.useState(false);
    const [videoError, setVideoError] = React.useState(null);

    const extractYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleVideoPress = (item) => {
        const youtubeId = extractYouTubeId(item.vurl);
        if (youtubeId) {
            setSelectedVideo({ ...item, videoId: youtubeId });
            setIsYouTube(true);
            setVideoLoading(true);
            setVideoError(null);
            setPlaying(false);
            setModalVisible(true);
        } else {
            setSelectedVideo({ ...item, videoId: item.vurl });
            setIsYouTube(false);
            setModalVisible(true);
        }
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.9}
            onPress={() => handleVideoPress(item)}
        >
            <LinearGradient
                colors={['#ffffff', '#f9f9f9']}
                style={styles.cardGradient}
            >
                {item.image && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.newsImage}
                            resizeMode="contain"
                        />
                        <View style={styles.videoIndicator}>
                            <Ionicons name="play-circle" size={28} color="#fff" />
                        </View>
                    </View>
                )}
                <View style={styles.newsContent}>
                    <Text style={styles.newsTitle} numberOfLines={2} ellipsizeMode="tail">
                        {item.title}
                    </Text>
                    <Text style={styles.newsDate}>{item.date}</Text>
                    <Text style={styles.newsDescription} numberOfLines={3} ellipsizeMode="tail">
                        {item.description}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.scene}>
            {data.length > 0 ? (
                <>
                    <FlatList
                        data={data}
                        renderItem={renderVideoItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.newsList}
                        showsVerticalScrollIndicator={false}
                    />
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(false);
                            setPlaying(false);
                            setVideoLoading(false);
                            setVideoError(null);
                        }}
                    >
                        <View style={styles.modalContainer}>
                            <LinearGradient
                                colors={['#1a1a1a', '#333333']}
                                style={styles.modalContent}
                            >
                                {selectedVideo && (
                                    <>
                                        <Text style={styles.modalTitle}>{selectedVideo.title}</Text>
                                        {isYouTube && selectedVideo.videoId ? (
                                            <View style={styles.videoContainer}>
                                                {videoLoading && !videoError && (
                                                    <View style={styles.videoLoading}>
                                                        <ActivityIndicator size="large" color="#fff" />
                                                        <Text style={styles.videoLoadingText}>Loading Video...</Text>
                                                    </View>
                                                )}
                                                {videoError ? (
                                                    <Text style={styles.videoErrorText}>{videoError}</Text>
                                                ) : (
                                                    <YoutubePlayer
                                                        height={220}
                                                        videoId={selectedVideo.videoId}
                                                        play={playing}
                                                        onReady={() => {
                                                            setVideoLoading(false);
                                                            setPlaying(true);
                                                        }}
                                                        onError={(error) => {
                                                            setVideoLoading(false);
                                                            setVideoError(`Failed to load video: ${error}`);
                                                        }}
                                                        onChangeState={(event) => {
                                                            if (event === 'ended') {
                                                                setModalVisible(false);
                                                                setPlaying(false);
                                                            }
                                                            if (event === 'playing') setPlaying(true);
                                                            if (event === 'paused') setPlaying(false);
                                                        }}
                                                    />
                                                )}
                                            </View>
                                        ) : (
                                            <Text style={styles.modalText}>
                                                Non-YouTube URL: {selectedVideo.videoId || 'No URL provided'}
                                            </Text>
                                        )}
                                        <Text style={styles.modalDescription} numberOfLines={2}>
                                            {selectedVideo.description}
                                        </Text>
                                    </>
                                )}
                                <Pressable
                                    style={styles.closeButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setPlaying(false);
                                        setVideoLoading(false);
                                        setVideoError(null);
                                    }}
                                >
                                    <Ionicons name="close" size={28} color="#fff" />
                                </Pressable>
                            </LinearGradient>
                        </View>
                    </Modal>
                </>
            ) : (
                <Text style={styles.noDataText}>No videos available.</Text>
            )}
        </View>
    );
};

/**
 * AllNews Component: Main component with tabs for Car News, Expert Reviews, and Videos
 */
const AllNews = () => {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'CarNews', title: 'Car News' },
        { key: 'ExpertReviews', title: 'Expert Reviews' },
        { key: 'Videos', title: 'Videos' },
    ]);
    const [allData, setAllData] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('https://carzchoice.com/api/latestcarupdate');
            // console.log("API Response:", response.data);

            const { carnews = [], expertreviews = [], videos = [] } = response.data;

            if (!carnews.length && !expertreviews.length && !videos.length) {
                throw new Error("No news data found in response.");
            }

            const imageBaseURL = "https://carzchoice.com/assets/backend-assets/images/";

            const formattedNews = [
                ...carnews,
                ...expertreviews,
                ...videos,
            ].map(item => ({
                id: item.id?.toString() || Math.random().toString(),
                title: item.blogtitle || 'Untitled',
                description: item.description || 'No description available.',
                image: item.blogimg ? `${imageBaseURL}${item.blogimg}` : null,
                date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : 'Unknown date',
                vurl: item.vurl,
                categorytype: item.categorytype || 'Unknown',
                blogpost: item.blogpost || '',
            }));

            setAllData(formattedNews);
        } catch (error) {
            if (error.response) {
                console.error("❌ API Error:", error.response.status, error.response.data);
                setError(error.response.status === 404 ? "News not found." : `Error ${error.response.status}: ${error.response.data?.message || "Something went wrong."}`);
            } else if (error.request) {
                console.error("❌ Network Error: No response received from server.");
                setError("Network error. Please try again later.");
            } else {
                console.error("❌ Unexpected Error:", error.message);
                setError(error.message || "An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchNews();
    }, []);

    const carNewsData = allData.filter(item => item.categorytype === "Car News");
    const expertReviewsData = allData.filter(item => item.categorytype === "Expert Reviews");
    const videosData = allData.filter(item => item.categorytype === "Videos" && item.vurl);

    const renderScene = SceneMap({
        CarNews: () => <CarNews data={carNewsData} />,
        ExpertReviews: () => <ExpertReviews data={expertReviewsData} />,
        Videos: () => <Videos data={videosData} />,
    });

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading News...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <LinearGradient
                    colors={['#d32f2f', '#b71c1c']}
                    style={styles.errorContainer}
                >
                    <Ionicons name="warning-outline" size={40} color="#fff" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable
                        style={styles.retryButton}
                        onPress={fetchNews}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </Pressable>
                </LinearGradient>
            </View>
        );
    }

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderTabBar={props => (
                <View style={styles.tabBar}>
                    {props.navigationState.routes.map((route, i) => (
                        <Pressable
                            key={route.key}
                            style={[
                                styles.tabItem,
                                index === i && styles.tabItemActive,
                            ]}
                            onPress={() => setIndex(i)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    index === i && styles.tabTextActive,
                                ]}
                            >
                                {route.title}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    scene: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
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
    retryButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#d32f2f',
    },
    noDataText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        textAlign: 'center',
        marginTop: 30,
    },
    newsList: {
        padding: 15,
    },
    newsCard: {
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
    },
    cardGradient: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
    },
    imageContainer: {
        position: 'relative',
    },
    newsImage: {
        width: 110,
        height: 110,
        borderRadius: 8,
        marginRight: 12,
        objectFit: 'contain',
    },
    videoIndicator: {
        position: 'absolute',
        top: 8,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 14,
        padding: 4,
    },
    newsContent: {
        flex: 1,
        justifyContent: 'start',
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0061ff',
        marginBottom: 6,
    },
    newsDate: {
        fontSize: 13,
        fontWeight: '500',
        color: '#888',
        marginBottom: 6,
    },
    newsDescription: {
        fontSize: 15,
        fontWeight: '400',
        color: '#555',
        lineHeight: 22,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    modalContent: {
        width: '90%',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ccc',
        textAlign: 'center',
        marginVertical: 20,
    },
    modalDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: '#bbb',
        textAlign: 'center',
        marginTop: 15,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 14,
        padding: 6,
    },
    videoContainer: {
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 15,
    },
    videoLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
    },
    videoLoadingText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    videoErrorText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ff4444',
        textAlign: 'center',
        padding: 20,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 5,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabItemActive: {
        borderBottomColor: '#0061ff',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActive: {
        color: '#0061ff',
    },
});

export default AllNews;