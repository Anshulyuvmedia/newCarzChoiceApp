import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, Modal, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const CarImageGallery = ({ id }) => {
    const [groupedImages, setGroupedImages] = useState({});
    const [flatImageList, setFlatImageList] = useState([]); // For lightbox modal
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const flatListRef = useRef(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const fetchImageData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`https://carzchoice.com/api/getcarimagesgallery/${id}`);
            // console.log("API Response:", response.data);

            if (response.data?.success && response.data?.data?.viewImages) {
                const viewImages = response.data.data.viewImages;
                const imageBaseURL = "https://carzchoice.com/assets/backend-assets/images/";

                // Group images by type locally
                const groupedData = viewImages.reduce((acc, image) => {
                    const type = image.type || 'Unknown';
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                    acc[type].push({
                        image: image.addimage
                            ? `${imageBaseURL}${image.addimage.replace(/\\/g, "/")}`
                            : null,
                        title: image.title || 'Untitled',
                        type: type,
                    });
                    return acc;
                }, {});

                // Filter out invalid images and empty groups
                const formattedGroupedImages = Object.keys(groupedData).reduce((acc, type) => {
                    const validImages = groupedData[type].filter(item => item.image);
                    if (validImages.length > 0) {
                        acc[type] = validImages;
                    }
                    return acc;
                }, {});

                // Create a flat list for the lightbox modal
                const flatList = Object.entries(formattedGroupedImages).flatMap(([type, images]) =>
                    images.map(image => ({ ...image, type }))
                );

                setGroupedImages(formattedGroupedImages);
                setFlatImageList(flatList);
            } else {
                throw new Error(response.data?.message || "Images not found in response.");
            }
        } catch (error) {
            if (error.response) {
                console.error("❌ API Error:", error.response.status, error.response.data);
                setError(error.response.status === 404 ? "Car not found. Please check the Car ID." : `Error ${error.response.status}: ${error.response.data?.message || "Something went wrong."}`);
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

    useEffect(() => {
        fetchImageData();
    }, [id]);

    const openLightbox = (type, index) => {
        // Calculate the global index in the flatImageList
        let globalIndex = 0;
        const types = Object.keys(groupedImages);
        for (let i = 0; i < types.length; i++) {
            const currentType = types[i];
            if (currentType === type) {
                globalIndex += index;
                break;
            }
            globalIndex += groupedImages[currentType].length;
        }

        setSelectedIndex(globalIndex);
        setModalVisible(true);
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: globalIndex, animated: false });
        }, 0);
    };

    const closeLightbox = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setModalVisible(false));
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setSelectedIndex(viewableItems[0].index);
        }
    }).current;

    const renderGalleryItem = ({ item }) => (
        <View style={styles.galleryItem}>
            <Image
                source={{ uri: item.image }}
                style={styles.galleryImage}
            />
        </View>
    );

    const renderDot = (index) => (
        <View
            key={index}
            style={[
                styles.dot,
                { backgroundColor: index === selectedIndex ? '#0061ff' : '#ccc' },
            ]}
        />
    );

    const renderImageItem = (type, image, index) => (
        <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => openLightbox(type, index)}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: image.image }}
                style={styles.image}
            />
            <Text style={styles.imageTitle}>{image.title}</Text>
        </TouchableOpacity>
    );

    const renderSection = (type, images) => (
        <View key={type} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{type}</Text>
            <FlatList
                data={images}
                renderItem={({ item, index }) => renderImageItem(type, item, index)}
                keyExtractor={(item, index) => `${type}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sectionImageList}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0061ff" />
                <Text style={styles.loadingText}>Loading Images...</Text>
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
        <View style={styles.container}>
            {Object.keys(groupedImages).length > 0 ? (
                <ScrollView
                    contentContainerStyle={styles.imageList}
                    showsVerticalScrollIndicator={false}
                >
                    {Object.entries(groupedImages).map(([type, images]) =>
                        renderSection(type, images)
                    )}
                </ScrollView>
            ) : (
                <Text style={styles.noDataText}>No images available.</Text>
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeLightbox}
            >
                <BlurView intensity={50} tint="dark" style={styles.modalContainer}>
                    <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
                        <FlatList
                            ref={flatListRef}
                            data={flatImageList}
                            renderItem={renderGalleryItem}
                            keyExtractor={(item, index) => index.toString()}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onViewableItemsChanged={onViewableItemsChanged}
                            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                            initialScrollIndex={selectedIndex}
                            getItemLayout={(data, index) => ({
                                length: width,
                                offset: width * index,
                                index,
                            })}
                        />
                        <Text style={styles.modalColorText}>
                            {flatImageList[selectedIndex]?.title || 'Untitled'}
                        </Text>
                        <Text className="text-white text-center font-bold text-sm">
                            ({flatImageList[selectedIndex]?.type || 'Unknown'})
                        </Text>
                        <View style={styles.dotContainer}>
                            {flatImageList.map((_, index) => renderDot(index))}
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeLightbox}
                        >
                            <AntDesign name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                </BlurView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
        color: 'black',
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
    imageList: {
        paddingVertical: 15,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginLeft: 15,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    sectionImageList: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    imageContainer: {
        marginRight: 15,
        alignItems: 'start',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    image: {
        width: 200,
        height: 120,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    imageTitle: {
        marginTop: 8,
        marginStart: 10,
        fontSize: 14,
        color: '#333',
        textAlign: 'start',
        fontWeight: '500',
        letterSpacing: 0.5,
        maxWidth: 180,
    },
    galleryItem: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    galleryImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
        borderRadius: 12,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalColorText: {
        marginTop: 20,
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    dotContainer: {
        flexDirection: 'row',
        marginTop: 15,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
});

export default CarImageGallery;