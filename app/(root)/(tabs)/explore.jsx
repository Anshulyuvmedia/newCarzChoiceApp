import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { Card } from '@/components/Cards';
import { LocationContext } from '@/components/LocationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const Explore = () => {
  const { currentCity } = useContext(LocationContext);
  const [listingData, setListingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false); // NEW
  const params = useLocalSearchParams();
  const [selectedFilters, setSelectedFilters] = useState({
    city: currentCity,
    budget: null,
    fuelType: null,
    transmission: null,
    color: null,
    brand: null,
  });
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const handleCardPress = (id) => router.push(`/vehicles/${id}`);

  const loadMoreCars = () => {
    if (loadingMore || visibleCount >= listingData.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 2);
      setLoadingMore(false);
    }, 300); // Optional: simulate network delay
  };

  const fetchFilterData = async () => {
    setLoading(true);
    setListingData([]);

    let requestBody = {
      attribute: {
        brand: params.brand || null,
        fuelType: params.fuelType || null,
        transmission: params.transmission || null,
        budget: params.budget || null,
        color: params.color || null,
      },
      location: params.city || null,
    };

    Object.keys(requestBody.attribute).forEach(
      (key) => requestBody.attribute[key] === null && delete requestBody.attribute[key]
    );
    if (!requestBody.location) delete requestBody.location;

    try {
      const response = await axios.post("https://carzchoice.com/api/filterOldCarByAttribute", requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.variants) {
        setListingData(response.data.variants);
      } else {
        setListingData([]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedFilters({
      city: params.city || null,
      budget: params.budget || null,
      fuelType: params.fuelType || null,
      transmission: params.transmission || null,
      color: params.color || null,
      brand: params.brand || null,
    });

    setVisibleCount(2);
    fetchFilterData();
  }, [JSON.stringify(params)]);

  const visibleCars = listingData.slice(0, visibleCount);

  return (
    <SafeAreaView className="bg-white  flex-1">
      <View className="px-5">
        <View className="flex flex-row items-center ml-2 mb-3 justify-between">
          <TouchableOpacity onPress={() => router.navigate('/')} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
            <Image source={icons.backArrow} className="size-5" />
          </TouchableOpacity>
          <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
            Search for Your Dream Car
          </Text>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Image source={icons.bell} className="size-6" />
          </TouchableOpacity>
        </View>

        <View className="min-h-[60px]">
          <Search selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
        </View>

        <View className="mt-3">
          <Text className="text-xl font-rubik-bold text-black-300 capitalize">
            {listingData.length > 0
              ? `${listingData.length} cars found in ${currentCity}`
              : ' '}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 300 }} />
      ) : (
        <FlatList
          data={visibleCars}
          renderItem={({ item }) => (
            <Card item={item} onPress={() => handleCardPress(item.id)} />
          )}
          keyExtractor={(item) => item.id?.toString()}
          numColumns={2}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <Text className="text-center text-red-700 mt-10 font-rubik-bold">Sorry No Vehicle Found...</Text>
              <Text className="text-center text-black-300 mt-10 font-rubik-bold">But you can sell your vehicle now!</Text>
              <TouchableOpacity onPress={() => router.push('/sellvehicle')} className="mt-4 rounded-full bg-primary-300  px-6 py-2">
                <Text className="text-center text-white">Sell Your Car Now</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + tabBarHeight + 80,
            paddingTop: 10,
          }}
          columnWrapperStyle={{ flex: 1, gap: 5, paddingHorizontal: 5 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreCars} // ✅ triggers load more
          onEndReachedThreshold={0.5}   // ✅ triggers earlier
        />
      )}
    </SafeAreaView>
  );
};

export default Explore;
