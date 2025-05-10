import * as React from 'react';
import { View, StyleSheet, Dimensions, FlatList, Image, Text, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

const CarNews = ({ data }) => {
    const router = useRouter();

    const renderNewsItem = ({ item }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.8}
            onPress={() => {
                // Pass the entire item as a JSON string in the query parameter
                router.push({
                    pathname: '/dashboard/news/newsdetailview',
                    params: { article: JSON.stringify(item) },
                });
            }}
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

const ExpertReviews = ({ data }) => {
    const router = useRouter();

    const renderReviewItem = ({ item }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.8}
            onPress={() => {
                // Pass the entire item as a JSON string in the query parameter
                router.push({
                    pathname: '/dashboard/news/newsdetailview',
                    params: { article: JSON.stringify(item) },
                });
            }}
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

const Videos = ({ data }) => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedVideoId, setSelectedVideoId] = React.useState(null);
    const [isYouTube, setIsYouTube] = React.useState(true);

    const extractYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleVideoPress = (vurl) => {
        const youtubeId = extractYouTubeId(vurl);
        if (youtubeId) {
            setSelectedVideoId(youtubeId);
            setIsYouTube(true);
            setModalVisible(true);
        } else {
            setSelectedVideoId(vurl);
            setIsYouTube(false);
            setModalVisible(true);
        }
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.8}
            onPress={() => handleVideoPress(item.vurl)}
        >
            {item.image && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.newsImage}
                        resizeMode="cover"
                    />
                    <View style={styles.videoIndicator}>
                        <Ionicons name="play-circle" size={24} color="#fff" />
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
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                {isYouTube && selectedVideoId ? (
                                    <YoutubePlayer
                                        height={220}
                                        videoId={selectedVideoId}
                                        play={modalVisible}
                                        onChangeState={(event) => {
                                            if (event === 'ended') setModalVisible(false);
                                        }}
                                    />
                                ) : (
                                    <Text style={styles.modalText}>
                                        Non-YouTube URL: {selectedVideoId || 'No URL provided'}
                                    </Text>
                                )}
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </>
            ) : (
                <Text style={styles.noDataText}>No videos available.</Text>
            )}
        </View>
    );
};

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
            const response = await axios.get('https://carzchoice.com/api/news');
            console.log("API Response:", response.data);

            if (response.data?.success === "true" && response.data?.allnews) {
                const newsItems = response.data.allnews;
                const imageBaseURL = "https://carzchoice.com/assets/backend-assets/images/";

                const formattedNews = newsItems
                    .filter(item => item.status === "1")
                    .map(item => ({
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
                        blogpost: item.blogpost || '', // Include blogpost for NewsDetailView
                    }));

                setAllData(formattedNews);
            } else {
                throw new Error(response.data?.message || "News not found in response.");
            }
        } catch (error) {
            if (error.response) {
                console.error("❌ API Error:", error.response.status, error.response.data);
                setError(error.response.status === 404 ? "News not found." : `Error ${error.response.status}: ${error.response.data?.message || "Something went wrong."}`);
            } else if (error.request) {
                console.error("❌ Network Error: No response received from server.");
                setError("Network error. Please try again later.");
            } else {
                console.error("❌ Unexpected Error:", error.message);
                setError("An unexpected error occurred.");
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
                <ActivityIndicator size="large" color="#0061ff" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get('window').width }}
        />
    );
};

const styles = StyleSheet.create({
    scene: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#0061ff',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#d32f2f',
        textAlign: 'center',
        backgroundColor: '#ffebee',
        padding: 10,
        borderRadius: 8,
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        fontWeight: '500',
    },
    newsList: {
        padding: 15,
    },
    newsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
    },
    newsImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
    videoIndicator: {
        position: 'absolute',
        top: 5,
        right: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        padding: 2,
    },
    newsContent: {
        flex: 1,
        justifyContent: 'center',
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    newsDate: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5,
    },
    newsDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginVertical: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        padding: 5,
    },
});

export default AllNews;