import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, Modal, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
const { width, height } = Dimensions.get('window');

const Carcolorgallery = ({ id, headerTitle }) => {
    const [colorData, setColorData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const flatListRef = useRef(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const fetchColorData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`https://carzchoice.com/api/getcarcolorimages/${id}`);
            // console.log("API Response:", response.data);

            if (response.data?.success && response.data?.data?.colorImages) {
                const apiData = response.data.data.colorImages;
                const imageBaseURL = "https://carzchoice.com/assets/backend-assets/images/";

                const formattedColorData = apiData.map(color => {
                    // console.log("Processing color:", color);
                    let parsedColor = { label: 'Unknown', value: [] };
                    try {
                        if (typeof color.color === 'string') {
                            parsedColor = JSON.parse(color.color);
                        }
                    } catch (e) {
                        console.error("❌ Error parsing color:", e, "Raw color:", color.color);
                    }
                    return {
                        image: color.addimage
                            ? `${imageBaseURL}${color.addimage.replace(/\\/g, "/")}`
                            : null,
                        colorName: parsedColor.label || 'Unknown',
                        colorValues: Array.isArray(parsedColor.value) ? parsedColor.value : [],
                    };
                }).filter(item => item && item.image);

                // console.log("Formatted Color Data:", formattedColorData);
                setColorData(formattedColorData);
            } else {
                throw new Error(response.data?.message || "Color images not found in response.");
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
        fetchColorData();
    }, [id]);

    const openLightbox = (index) => {
        setSelectedIndex(index);
        setModalVisible(true);
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: false });
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

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0061ff" />
                <Text style={styles.loadingText}>Loading Colors...</Text>
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
            {colorData.length > 0 ? (
                <>

                    <Text className="text-xl font-rubik-bold px-4 my-3">
                        {headerTitle} has {colorData?.length} Color Options
                    </Text>
                    <ScrollView
                        contentContainerStyle={styles.imageList}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.gridContainer}>
                            {colorData.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.imageContainer}
                                    onPress={() => openLightbox(index)}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.image}
                                    />
                                    <Text style={styles.colorText}>{item.colorName}</Text>
                                    <View style={styles.colorSwatchContainer}>
                                        {Array.isArray(item.colorValues) && item.colorValues.length > 0 ? (
                                            item.colorValues.map((color, swatchIndex) => {
                                                try {
                                                    return (
                                                        <View
                                                            key={swatchIndex}
                                                            style={[styles.colorSwatch, { backgroundColor: color }]}
                                                        />
                                                    );
                                                } catch (e) {
                                                    console.error("Error rendering color swatch:", e, "Color:", color);
                                                    return null;
                                                }
                                            })
                                        ) : (
                                            <View style={styles.noColorContainer}>
                                                <MaterialIcons name="palette" size={16} color="#888" />
                                                <Text style={styles.noColorText}>No colors available</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

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
                                    data={colorData}
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
                                    {colorData[selectedIndex]?.colorName || 'Unknown'}
                                </Text>
                                <View style={styles.dotContainer}>
                                    {colorData.map((_, index) => renderDot(index))}
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
                </>
            ) : (
                <Text style={styles.noDataText}>No color images available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        marginBottom: 70,
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
        padding: 15,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    imageContainer: {
        width: '48%',
        marginBottom: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 160,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        resizeMode: 'cover',
    },
    colorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    colorSwatchContainer: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    colorSwatch: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    noColorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    noColorText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        fontStyle: 'italic',
        marginLeft: 4,
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
        borderRadius: 10,
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

export default Carcolorgallery;