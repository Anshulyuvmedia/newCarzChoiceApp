import { StyleSheet, Text, TouchableOpacity, View, Image, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';

// Create an animated version of TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Utility to safely parse JSON
const safeParseJSON = (value, fallback = null) => {
  if (!value || typeof value !== "string") return fallback || value;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`JSON Parsing Failed: ${value}`, error.message);
    return fallback || value;
  }
};

// Skeleton Loader Component for Images
const SkeletonLoader = ({ width, height, borderRadius }) => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#E5E7EB',
        opacity: pulseAnim,
      }}
    />
  );
};

const FeaturedCard = ({ item, onPress }) => {
  const mileage = safeParseJSON(item.mileage, {});
  const formattedMileage = Object.entries(mileage)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  const fuelTypes = safeParseJSON(item.fueltype, []);
  const transmissionType = safeParseJSON(item.transmission, [])[0] || 'N/A';
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      style={[styles.featuredCardContainer, { opacity: opacityAnim }]}
    >
      {item.addimage ? (
        <Image
          source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.addimage}` }}
          style={styles.featuredCardImage}
          resizeMode='cover'
        />
      ) : (
        <SkeletonLoader width={320} height={256} borderRadius={16} />
      )}

      {/* Glassmorphic Overlay */}
      <View style={styles.featuredCardOverlay} />

      <View style={styles.featuredCardContent}>
        <Text style={styles.featuredCardTitle} numberOfLines={1}>
          {item.carname} {item.modalname || ''}
        </Text>
        <Text style={styles.featuredCardBrand} numberOfLines={1}>
          {item.brandname || 'N/A'}
        </Text>
        <View style={styles.featuredCardBadges}>
          {fuelTypes.length > 0 && (
            <View style={styles.badge}>
              <Text style={[styles.badgeText, fuelTypes.includes('CNG') && styles.badgeTextUppercase]}>
                {fuelTypes.join(', ')}
              </Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {transmissionType}
            </Text>
          </View>
        </View>
        {/* <Text style={styles.featuredCardMileage} numberOfLines={1}>
          {formattedMileage || 'Mileage: N/A'}
        </Text> */}
        {/* {(item.district || item.state || item.manufactureyear) && (
          <View style={styles.featuredCardFooter}>
            <Text style={styles.featuredCardLocation} numberOfLines={1}>
              {item.district && item.state ? `${item.district}, ${item.state}` : 'Location: N/A'}
            </Text>
            <Text style={styles.featuredCardYear}>
              {item.manufactureyear || 'Year: N/A'}
            </Text>
          </View>
        )} */}
      </View>
    </AnimatedTouchableOpacity>
  );
};

const Card = ({ item, onPress }) => {
  const mileage = safeParseJSON(item.mileage, {});
  const formattedMileage = Object.entries(mileage)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  const fuelTypes = safeParseJSON(item.fueltype, []);
  // const transmissions = safeParseJSON(item.transmission, []);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      style={[styles.cardContainer, { opacity: opacityAnim }]}
    >
      {item.addimage ? (
        <Image
          source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.addimage}` }}
          style={styles.cardImage}
          resizeMode='cover'
        />
      ) : (
        <SkeletonLoader width='100%' height={160} borderRadius={12} />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardMainContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.brandname} {item.carname}
          </Text>
          <View style={styles.cardBadges}>
            {/* {fuelTypes.length > 0 && (
              <View style={styles.badgeLight}>
                <Text style={[styles.badgeTextLight, fuelTypes.includes('CNG') && styles.badgeTextUppercase]}>
                  {fuelTypes.join(', ')}
                </Text>
              </View>
            )} */}
            {/* {transmissions.length > 0 && (
              <View style={styles.badgeLight}>
                <Text style={styles.badgeTextLight}>
                  {transmissions.join(', ')}
                </Text>
              </View>
            )} */}

            <View style={styles.badgeLight}>
              <Text style={styles.badgeTextLight}>
                {item.bodytype?.trim().replace("Compect", "Compact") || 'N/A'}
              </Text>
            </View>
          </View>
          {/* {formattedMileage && (
                        <Text style={styles.cardMileage} numberOfLines={1}>
                            {formattedMileage}
                        </Text>
                    )} */}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardPriceContainer}>
            <Text style={styles.cardPriceLabel}>Price</Text>
            <Text style={styles.cardPrice}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const LocationCard = ({ item, onPress }) => {
  const imagesArray = safeParseJSON(item.images, []);
  const firstImageUrl = imagesArray.length > 0 ? imagesArray[0]?.imageurl : null;
  const transmissionType = safeParseJSON(item.transmissiontype, [])[0] || item.transmissiontype || 'N/A';
  const fuelType = safeParseJSON(item.fueltype, [])[0] || item.fueltype || 'N/A';
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      style={[styles.locationCardContainer, { opacity: opacityAnim }]}
    >
      {firstImageUrl ? (
        <Image
          source={{ uri: `https://carzchoice.com/${firstImageUrl}` }}
          style={styles.cardImage}
          resizeMode='cover'
        />
      ) : (
        <SkeletonLoader width={256} height={160} borderRadius={12} />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardMainContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.carname} {item.modalname || ''}
          </Text>
          <Text style={styles.cardBrand} numberOfLines={1}>
            {item.brandname || 'N/A'}
          </Text>
          <View style={styles.cardBadges}>
            {fuelType !== 'N/A' && (
              <View style={styles.badgeLight}>
                <Text style={[styles.badgeTextLight, fuelType === 'CNG' && styles.badgeTextUppercase]}>
                  {fuelType}
                </Text>
              </View>
            )}
            {transmissionType !== 'N/A' && (
              <View style={styles.badgeLight}>
                <Text style={styles.badgeTextLight}>
                  {transmissionType}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.cardMileage}>
            Driven: {item.kilometersdriven ? `${item.kilometersdriven} Kms` : 'N/A'}
          </Text>
          <Text style={styles.cardMileage} numberOfLines={1}>
            Color: {item.color || 'N/A'}
          </Text>
        </View>

        <View style={styles.locationCardFooter}>
          <View style={styles.locationCardPriceYearContainer}>
            <View>
              <Text style={styles.cardPriceLabel}>Price</Text>
              <Text style={styles.cardPrice}>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
              </Text>
            </View>
            <View>
              <Text style={styles.cardPriceLabel}>Year</Text>
              <Text style={styles.cardYear}>
                {item.manufactureyear || 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.locationCardLocationContainer}>
            <Image source={icons.location} style={styles.locationIcon} />
            <Text style={styles.cardLocation} numberOfLines={1}>
              {item.district && item.state ? `${item.district}, ${item.state}` : 'Location: N/A'}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const PopularCard = ({ item, onPress }) => {
  const mileage = safeParseJSON(item.mileage, {});
  const formattedMileage = Object.entries(mileage)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  const fuelTypes = safeParseJSON(item.fueltype, []);
  const transmissions = safeParseJSON(item.transmission, []);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      style={[styles.popularCardContainer, { opacity: opacityAnim }]}
    >
      {item.addimage ? (
        <Image
          source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.addimage}` }}
          style={styles.cardImage}
          resizeMode='cover'
        />
      ) : (
        <SkeletonLoader width={256} height={160} borderRadius={12} />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardMainContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.brandname} {item.carname}
          </Text>
          <View style={styles.cardBadges}>
            {fuelTypes.length > 0 && (
              <View style={styles.badgeLight}>
                <Text style={[styles.badgeTextLight, fuelTypes.includes('CNG') && styles.badgeTextUppercase]}>
                  {fuelTypes.join(', ')}
                </Text>
              </View>
            )}
            {transmissions.length > 0 && (
              <View style={styles.badgeLight}>
                <Text style={styles.badgeTextLight}>
                  {transmissions.join(', ')}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.cardBodyType} numberOfLines={1}>
            {item.bodytype?.trim().replace("Compect", "Compact") || 'N/A'}
          </Text>
          {formattedMileage && (
            <Text style={styles.cardMileage} numberOfLines={1}>
              {formattedMileage}
            </Text>
          )}
        </View>

        <View style={styles.popularCardFooter}>
          <View style={styles.cardPriceContainer}>
            <Text style={styles.cardPriceLabel}>Price</Text>
            <Text style={styles.cardPrice}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
            </Text>
          </View>
          {(item.district || item.state) && (
            <View style={styles.locationCardLocationContainer}>
              <Image source={icons.location} style={styles.locationIcon} />
              <Text style={styles.cardLocation} numberOfLines={1}>
                {item.district && item.state ? `${item.district}, ${item.state}` : 'Location: N/A'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

// Card Component
const SimilarCarCard = ({ item, onPress }) => {
  const mileage = safeParseJSON(item.mileage, {});
  const formattedMileage = Object.entries(mileage)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  const fuelTypes = safeParseJSON(item.fueltype, []);
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  return (
    <Animated.View style={[styles.cardContainer, { opacity: opacityAnim }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {item.addimage ? (
          <Image
            source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.addimage}` }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <SkeletonLoader width="100%" height={160} borderRadius={12} />
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardMainContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.brandname} {item.carname}
            </Text>
            <View style={styles.cardBadges}>
              <View style={styles.badgeLight}>
                <Text style={styles.badgeTextLight}>
                  {item.bodytype?.trim().replace("Compect", "Compact") || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardPriceContainer}>
              <Text style={styles.cardPriceLabel}>Price</Text>
              <Text style={styles.cardPrice}>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(item.price)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export { FeaturedCard, Card, LocationCard, PopularCard, SimilarCarCard };

const styles = StyleSheet.create({
  // FeaturedCard Styles
  featuredCardContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: 320,
    height: 256,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'absolute',
  },
  featuredCardOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredCardContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  featuredCardTitle: {
    fontSize: 24,
    fontFamily: 'Rubik-Bold',
    color: '#FFFFFF',
  },
  featuredCardBrand: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuredCardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Rubik-Medium',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  badgeTextUppercase: {
    textTransform: 'uppercase',
  },
  featuredCardMileage: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  featuredCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  featuredCardLocation: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuredCardYear: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Card Styles
  cardContainer: {
    width: '50%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cardMainContent: {
    flexGrow: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Rubik-Bold',
    color: '#111827',
  },
  cardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  badgeLight: {
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeTextLight: {
    fontSize: 12,
    fontFamily: 'Rubik-Medium',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  cardBodyType: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    color: '#4B5563',
    marginTop: 4,
  },
  cardMileage: {
    fontSize: 14,
    fontFamily: 'Rubik-Regular',
    color: '#4B5563',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  cardPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 4,
  },
  cardPriceLabel: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    color: '#4B5563',
  },
  cardPrice: {
    fontSize: 14,
    fontFamily: 'Rubik-Bold',
    color: '#2563EB',
  },

  // LocationCard Styles
  locationCardContainer: {
    width: 256,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBrand: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    color: '#4B5563',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  locationCardFooter: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  locationCardPriceYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardYear: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    color: '#4B5563',
  },
  locationCardLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  locationIcon: {
    width: 20,
    height: 20,
  },
  cardLocation: {
    fontFamily: 'Rubik-Medium',
    color: '#4B5563',
    textTransform: 'capitalize',
    marginLeft: 8,
  },

  // PopularCard Styles
  popularCardContainer: {
    width: 256,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularCardFooter: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
});