import React, { useRef, useState, useEffect } from 'react';
import { View, Dimensions, Image, TouchableOpacity, Pressable } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import axios from 'axios';

const { width } = Dimensions.get('window');

const fallbackData = [
    {
        image: 'https://stimg.cardekho.com/images/uploadimages/1741678105500/CD-MasterHead_Mobile_624x340px-(3).jpg',
        title: 'Tata Harrier EV',
        link: 'https://cardekho.com/tata-harrier-ev',
    },
    {
        image: 'https://stimg.cardekho.com/images/uploadimages/1741678105500/CD-MasterHead_Mobile_624x340px-(3).jpg',
        title: 'Mahindra XUV400',
        link: 'https://cardekho.com/mahindra-xuv400',
    },
];

const BannerSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [sliderData, setSliderData] = useState([]);
    const [loading, setLoading] = useState(false);
    const carouselRef = useRef(null);

    const fetchSliderImages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/fetchSliderImages`);
            // console.log('API Response:', response.data);
    
            if (response.data && response.data.success) {
                const imageString = response.data.data.mobileimages;
                const imageArray = imageString.split(','); // split by commas
                const formattedData = imageArray.map((relativePath) => ({
                    image: `https://carzchoice.com/${relativePath}`,
                    title: '',
                    link: '',
                }));
                setSliderData(formattedData);
                // console.log('Formatted slider data:', formattedData);
            } else {
                console.error('Unexpected API response format:', response.data);
            }
    
        } catch (error) {
            console.error('Error fetching slider data:', error);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchSliderImages();
    }, []);

    const slides = Array.isArray(sliderData) && sliderData.length > 0 ? sliderData : fallbackData;

    return (
        <View style={{ marginBottom: 16 }}>
            <Carousel
                ref={carouselRef}
                loop
                width={width}
                height={200}
                autoPlay={true}
                autoPlayInterval={7000}
                scrollAnimationDuration={3000}
                data={slides}
                onSnapToItem={(index) => setActiveIndex(index)}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => console.log('Navigate to:', item.link)}>
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: '95%',
                                height: 200,
                                borderRadius: 12,
                                alignSelf: 'start',
                            }}
                        />
                    </TouchableOpacity>
                )}
            />

            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 10,
            }}>
                {slides.map((_, index) => (
                    <Pressable
                        key={index}
                        onPress={() => {
                            setActiveIndex(index);
                            carouselRef.current?.scrollTo({ index });
                        }}
                    >
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                marginHorizontal: 4,
                                backgroundColor: activeIndex === index ? '#0061ff' : 'gray',
                            }}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

export default BannerSlider;
