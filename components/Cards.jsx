import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';

const safeParseJSON = (value, fallback = null) => {
  if (!value || typeof value !== "string") return fallback || value;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`JSON Parsing Failed: ${value}`, error.message);
    return fallback || value;
  }
};

const FeaturedCard = ({ item, onPress }) => {
  let imagesArray = safeParseJSON(item.images, []);
  const firstImageUrl = imagesArray.length > 0 ? imagesArray[0]?.imageurl : null;
  const transmissionType = item.transmissiontype;

  return (
    <View>
      <TouchableOpacity onPress={onPress} className='flex flex-col items-start w-80 h-60 relative'>
        {firstImageUrl ? (
          <Image source={{ uri: `https://carzchoice.com/${firstImageUrl}` }} className='size-full rounded-2xl' />
        ) : (
          <Text className="text-white">Image Not Available</Text>
        )}

        <Image source={images.cardGradient} className='size-full rounded-2xl absolute bottom-0' />

        <View className='flex flex-col items-start absolute bottom-5 inset-x-5'>
          <Text className='text-xl font-rubik-extrabold text-white' numberOfLines={1}>{item.carname} {item.modalname}</Text>
          <Text className='text-base font-rubik text-white' numberOfLines={1}> {item.brandname}</Text>
          <View className='flex flex-row flex-wrap'>
            <Text className='text-s font-rubik text-white'>
              {item.color} •
            </Text>
            <Text className={`text-s font-rubik text-white ms-1 ${item.fueltype === 'CNG' ? 'uppercase' : 'capitalize'}`}>
              {item.fueltype} •
            </Text>
            <Text className='text-s font-rubik text-white capitalize ms-1'>
              {transmissionType}
            </Text>
          </View>
          <View className='flex flex-row items-center justify-between w-full'>
            <Text className='text-xl font-rubik-extrabold text-white capitalize'>{item.district}, {item.state}</Text>
            <Text className='text-xl font-rubik-extrabold text-white'>{item.manufactureyear}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export { FeaturedCard };

const Card = ({ item, onPress }) => {
  let imagesArray = safeParseJSON(item.images, []);
  const firstImageUrl = imagesArray.length > 0 ? imagesArray[0]?.imageurl : null;
  const transmissionType = item.transmissiontype;

  return (
    <TouchableOpacity
      onPress={onPress}
      className='flex w-1/2 px-2 py-3 mt-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative'
    >
      {firstImageUrl ? (
        <Image
          source={{ uri: `https://carzchoice.com/${firstImageUrl}` }}
          className='w-full h-40 rounded-lg'
        />
      ) : (
        <Text className="text-black">Image Not Available</Text>
      )}

      <View className='flex flex-1 flex-col justify-between mt-2'>
        <View className='flex-grow'>
          <Text className='text-base font-rubik-medium text-primary-300'>
            {item.carname} {item.modalname}
          </Text>
          <View className='flex flex-row flex-wrap'>
            <Text className='text-sm font-rubik-medium text-black-300 capitalize'>
              {item.brandname}
            </Text>
          </View>

          <Text className='text-sm font-rubik text-black-300'>
            Driven: {item.kilometersdriven} Kms
          </Text>

          <View className='flex flex-row flex-wrap'>
            <Text className='text-sm font-rubik text-black-300'>
              {item.color} •
            </Text>
            <Text className='text-sm font-rubik text-black-300 capitalize ms-1'>
              {transmissionType} •
            </Text>
            <Text className={`text-sm font-rubik text-black-300 ms-1 ${item.fueltype === 'CNG' ? 'uppercase' : 'capitalize'}`}>
              {item.fueltype}
            </Text>
          </View>
        </View>

        <View className="flex flex-col justify-start align-middle">
          <View className='flex flex-row items-center justify-between'>
            <View>
              <Text className="text-xs">Price</Text>
              <Text className='text-base font-rubik-bold text-primary-300'>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
              </Text>
            </View>
            <View>
              <Text className="text-xs">Year</Text>
              <Text className='text-s font-rubik-medium text-black capitalize'>
                {item.manufactureyear}
              </Text>
            </View>
          </View>

          <View className="flex flex-row pt-2 border-t border-gray-300">
            <Image source={icons.location} className="w-5 h-5" />
            <Text className="font-rubik-medium capitalize ml-1">
              {item.district}, {item.state}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export { Card };

const LocationCard = ({ item, onPress }) => {
  let imagesArray = safeParseJSON(item.images, []);
  const firstImageUrl = imagesArray.length > 0 ? imagesArray[0]?.imageurl : null;
  const transmissionType = item.transmissiontype;

  return (
    <TouchableOpacity
      onPress={onPress}
      className='w-64 px-2 py-3  rounded-lg bg-white shadow-lg shadow-black-100/70 relative'
    >

      {firstImageUrl ? (
        <Image
          source={{ uri: `https://carzchoice.com/${firstImageUrl}` }}
          className='w-full h-40 rounded-lg'
        />
      ) : (
        <Text className="text-black">Image Not Available</Text>
      )}

      <View className='flex flex-1 flex-col justify-between mt-2'>
        <View className='flex-grow'>
          <Text className='text-base font-rubik-medium text-primary-300'>
            {item.carname} {item.modalname}
          </Text>
          <View className='flex flex-row flex-wrap'>
            <Text className='text-sm font-rubik-medium text-black-300 capitalize'>
              {item.brandname}
            </Text>
          </View>

          <Text className='text-sm font-rubik text-black-300'>
            Driven: {item.kilometersdriven} Kms
          </Text>

          <View className='flex flex-row flex-wrap'>
            <Text className='text-sm font-rubik text-black-300'>
              {item.color} •
            </Text>
            <Text className='text-sm font-rubik text-black-300 capitalize ms-1'>
              {transmissionType} •
            </Text>
            <Text className={`text-sm font-rubik text-black-300 ms-1 ${item.fueltype === 'CNG' ? 'uppercase' : 'capitalize'}`}>
              {item.fueltype}
            </Text>
          </View>
        </View>

        <View className="flex flex-col justify-start align-middle">
          <View className='flex flex-row items-center justify-between'>
            <View>
              <Text className="text-xs">Price</Text>
              <Text className='text-base font-rubik-bold text-primary-300'>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
              </Text>
            </View>
            <View>
              <Text className="text-xs">Year</Text>
              <Text className='text-s font-rubik-medium text-black capitalize'>
                {item.manufactureyear}
              </Text>
            </View>
          </View>

          <View className="flex flex-row pt-2 border-t border-gray-300">
            <Image source={icons.location} className="w-5 h-5" />
            <Text className="font-rubik-medium capitalize ml-1">
              {item.district}, {item.state}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export { LocationCard };

const styles = StyleSheet.create({});
