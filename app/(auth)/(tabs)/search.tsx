import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';



export interface Car {
  _id: string;
  carMake: string;
  carModel: string;
  carYear: string;
  carImageUrls: string[];
  price: number;
  fuelType?: string;
  transmission?: string;
  views: number;
  savedBy: string[];
  ownerDetails?: {
    name: string;
    rating: number;
    imageUrl?: string;
  };
  features?: string[];
}

export interface Filters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  fuelType?: string;
  location?: string;
}

interface Option {
  label: string;
  value: any;
  isSelected?: boolean;
}

interface FilterPillProps {
  label: string;
  isActive: boolean;
  isSelected: boolean;
  onPress: () => void;
}

interface FilterOptionsProps {
  options: Option[];
  selectedValue: any;
  onSelect: (value: any) => void;
}

interface FilterSectionProps {
  title: string;
  options: Option[];
  selectedValue: any;
  onSelect: (value: any) => void;
}

interface CarCardProps {
  car: Car;
  index: number;
  router: ReturnType<typeof useRouter>;
  userId: string;
  onToggleSave: (postId: string) => void;
}

interface EmptyStateProps {
  onReset: () => void;
}

interface SearchSuggestion {
  type: 'make' | 'model' | 'location' | 'year' | 'combined';
  value: string;
}


const Colors = {
  primary: '#3366FF',
  primaryLight: '#EEF3FF',
  background: '#F7F9FC',
  white: '#FFFFFF',
  black: '#222B45',
  gray: '#8F9BB3',
  lightGray: '#EDF1F7',
  borderGray: '#E4E9F2',
  success: '#00E096',
  error: '#FF3D71',
  warning: '#FFAA00',
  yellow: '#FFCC00',
};

const SearchScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
 const convexUser = useQuery(api.users.current);
  const userId = convexUser?._id!;
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchQuery]);


  const carMakes: string[] = ['Toyota', 'Hyundai', 'BMW', 'Tesla', 'Mercedes', 'Ford', 'Audi'];
  const fuelTypes: string[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const transmissionTypes: string[] = ['Automatic', 'Manual'];
  const priceRanges = [
    { label: 'Under $10K', min: 0, max: 10000 },
    { label: '$10K-$30K', min: 10000, max: 30000 },
    { label: '$30K-$50K', min: 30000, max: 50000 },
    { label: 'Over $50K', min: 50000, max: 1000000 }
  ];


  const searchSuggestions: SearchSuggestion[] | undefined = useQuery(api.post.getSearchSuggestions, {
    searchTerm: debouncedSearchTerm,
    limit: 8
  });


  const searchResults: Car[] | undefined = useQuery(api.post.searchPosts, {
    searchTerm: debouncedSearchTerm,
    filters: filters,
  });


  const toggleSave = useMutation(api.post.toggleSavePost);

  const handleToggleSave = (postId: string) => {
    if (!userId) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSave({ postId, userId });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleSearchInputFocus = () => {
    setShowSuggestions(true);
    if (searchQuery.length === 0) {
        setFilters({});
       }
  };

  const handleSearchInputBlur = () => {

    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value);
    setShowSuggestions(false);

    if (suggestion.type === 'make') {
      setFilters(prev => ({ ...prev, make: suggestion.value }));
    } else if (suggestion.type === 'model') {
      setFilters(prev => ({ ...prev, model: suggestion.value }));
    } else if (suggestion.type === 'location') {
      setFilters(prev => ({ ...prev, location: suggestion.value }));
    } else if (suggestion.type === 'combined') {
      const parts = suggestion.value.split(' ');
      const make = parts[0];
      const model = parts.slice(1).join(' ');
      setFilters(prev => ({ ...prev, make, model }));
    }
  };

  const handleFilterSelect = (type: string, value: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (type === 'make') {
      setFilters((prev) => ({ ...prev, make: value === prev.make ? undefined : value }));
    } else if (type === 'fuelType') {
      setFilters((prev) => ({ ...prev, fuelType: value === prev.fuelType ? undefined : value }));
    } else if (type === 'transmission') {
      setFilters((prev) => ({ ...prev, transmission: value === prev.transmission ? undefined : value }));
    } else if (type === 'priceRange') {
      setFilters((prev) => ({
        ...prev,
        minPrice: prev.minPrice === value.min ? undefined : value.min,
        maxPrice: prev.maxPrice === value.max ? undefined : value.max,
      }));
    }
  };

  const clearAllFilters = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFilters({});
    setSearchQuery('');
    setActiveFilter(null);
  };

  const getFilterCount = (): number => {
    let count = 0;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.location) count++;
    if (filters.fuelType) count++;
    if (filters.transmission) count++;
    if (filters.minPrice !== undefined) count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Find Your Perfect Car',
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      />


      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search makes, models, locations..."
            placeholderTextColor={Colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
          />
        {searchQuery.length > 0 && (
  <TouchableOpacity 
    onPress={() => {
      setSearchQuery('');
    
    }}>
    <MaterialIcons name="close" size={20} color={Colors.gray} />
  </TouchableOpacity>
)}
        </View>

        
        {showSuggestions && searchSuggestions && searchSuggestions.length > 0 && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.suggestionsContainer}>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <MaterialIcons 
                  name={
                    suggestion.type === 'make' ? 'directions-car' : 
                    suggestion.type === 'model' ? 'local-taxi' :
                    suggestion.type === 'location' ? 'location-on' :
                    suggestion.type === 'year' ? 'date-range' : 'search'
                  } 
                  size={18} 
                  color={Colors.gray} 
                />
                <Text style={styles.suggestionText}>{suggestion.value}</Text>
                <Text style={styles.suggestionType}>
                  {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>

 
      <View style={styles.filtersRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              getFilterCount() > 0 && styles.activeFilterPill,
            ]}
            onPress={() => setActiveFilter(activeFilter === 'all' ? null : 'all')}
          >
            <MaterialIcons
              name="tune"
              size={16}
              color={getFilterCount() > 0 ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.filterPillText,
                getFilterCount() > 0 && styles.activeFilterPillText,
              ]}
            >
              {getFilterCount() > 0 ? `Filters (${getFilterCount()})` : 'All Filters'}
            </Text>
          </TouchableOpacity>

          <FilterPill
            label={filters.make || 'Make'}
            isActive={activeFilter === 'make'}
            isSelected={!!filters.make}
            onPress={() => setActiveFilter(activeFilter === 'make' ? null : 'make')}
          />

          <FilterPill
            label={
              filters.minPrice !== undefined
                ? `$${filters.minPrice / 1000}k-$${filters.maxPrice! / 1000}k`
                : 'Price'
            }
            isActive={activeFilter === 'price'}
            isSelected={filters.minPrice !== undefined}
            onPress={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
          />

          <FilterPill
            label={filters.fuelType || 'Fuel'}
            isActive={activeFilter === 'fuel'}
            isSelected={!!filters.fuelType}
            onPress={() => setActiveFilter(activeFilter === 'fuel' ? null : 'fuel')}
          />

          <FilterPill
            label={filters.transmission || 'Transmission'}
            isActive={activeFilter === 'transmission'}
            isSelected={!!filters.transmission}
            onPress={() => setActiveFilter(activeFilter === 'transmission' ? null : 'transmission')}
          />

          {getFilterCount() > 0 && (
            <TouchableOpacity style={styles.clearFilterButton} onPress={clearAllFilters}>
              <Text style={styles.clearFilterText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

  
      {activeFilter && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.expandedFilterContainer}>
          {activeFilter === 'make' && (
            <FilterOptions
              options={carMakes.map((make) => ({ label: make, value: make }))}
              selectedValue={filters.make}
              onSelect={(value) => handleFilterSelect('make', value)}
            />
          )}

          {activeFilter === 'fuel' && (
            <FilterOptions
              options={fuelTypes.map((fuel) => ({ label: fuel, value: fuel }))}
              selectedValue={filters.fuelType}
              onSelect={(value) => handleFilterSelect('fuelType', value)}
            />
          )}

          {activeFilter === 'transmission' && (
            <FilterOptions
              options={transmissionTypes.map((trans) => ({ label: trans, value: trans }))}
              selectedValue={filters.transmission}
              onSelect={(value) => handleFilterSelect('transmission', value)}
            />
          )}

          {activeFilter === 'price' && (
            <FilterOptions
              options={priceRanges.map((range) => ({
                label: range.label,
                value: range,
                isSelected: filters.minPrice === range.min && filters.maxPrice === range.max,
              }))}
              selectedValue={null}
              onSelect={(value) => handleFilterSelect('priceRange', value)}
            />
          )}

          {activeFilter === 'all' && (
            <View style={styles.allFiltersContainer}>
              <FilterSection
                title="Car Make"
                options={carMakes.map((make) => ({ label: make, value: make }))}
                selectedValue={filters.make}
                onSelect={(value) => handleFilterSelect('make', value)}
              />

              <FilterSection
                title="Price Range"
                options={priceRanges.map((range) => ({
                  label: range.label,
                  value: range,
                  isSelected: filters.minPrice === range.min && filters.maxPrice === range.max,
                }))}
                selectedValue={null}
                onSelect={(value) => handleFilterSelect('priceRange', value)}
              />

              <FilterSection
                title="Fuel Type"
                options={fuelTypes.map((fuel) => ({ label: fuel, value: fuel }))}
                selectedValue={filters.fuelType}
                onSelect={(value) => handleFilterSelect('fuelType', value)}
              />

              <FilterSection
                title="Transmission"
                options={transmissionTypes.map((trans) => ({ label: trans, value: trans }))}
                selectedValue={filters.transmission}
                onSelect={(value) => handleFilterSelect('transmission', value)}
              />
            </View>
          )}
        </Animated.View>
      )}


      {searchResults === undefined ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding cars for you...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {searchResults.length > 0 ? (
            <>
              <View style={styles.resultHeader}>
                <Text style={styles.resultCount}>
                  {searchResults.length} {searchResults.length === 1 ? 'car' : 'cars'} found
                </Text>
                {/* <TouchableOpacity style={styles.sortButton}>
                  <MaterialIcons name="sort" size={18} color={Colors.primary} />
                  <Text style={styles.sortText}>Sort</Text>
                </TouchableOpacity> */}
              </View>

              {searchResults.map((car, index) => (
                <CarCard 
                  key={car._id} 
                  car={car} 
                  index={index} 
                  router={router} 
                  userId={userId} 
                  onToggleSave={handleToggleSave}
                />
              ))}

              <View style={{ height: 20 }} />
            </>
          ) : (
            <EmptyState onReset={clearAllFilters} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};


const FilterPill: React.FC<FilterPillProps> = ({ label, isActive, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.filterPill,
      isActive && styles.activeFilterPill,
      !isActive && isSelected && styles.selectedFilterPill,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.filterPillText,
        isActive && styles.activeFilterPillText,
        !isActive && isSelected && styles.selectedFilterPillText,
      ]}
    >
      {label}
    </Text>
    <MaterialIcons
      name={isActive ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
      size={16}
      color={isActive ? Colors.white : isSelected ? Colors.primary : Colors.gray}
    />
  </TouchableOpacity>
);


const FilterOptions: React.FC<FilterOptionsProps> = ({ options, selectedValue, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {options.map((option, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.filterOption,
          (option.isSelected || option.value === selectedValue) && styles.selectedFilterOption,
        ]}
        onPress={() => onSelect(option.value)}
      >
        <Text
          style={[
            styles.filterOptionText,
            (option.isSelected || option.value === selectedValue) && styles.selectedFilterOptionText,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const FilterSection: React.FC<FilterSectionProps> = ({ title, options, selectedValue, onSelect }) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterSectionTitle}>{title}</Text>
    <View style={styles.filterOptionsGrid}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.filterOptionSmall,
            (option.isSelected || option.value === selectedValue) && styles.selectedFilterOption,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.filterOptionText,
              (option.isSelected || option.value === selectedValue) && styles.selectedFilterOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);


const CarCard: React.FC<CarCardProps> = ({ car, index, router, userId, onToggleSave }) => {
  const isSaved = car.savedBy?.includes(userId);
  
  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(300)}>
      <TouchableOpacity
        style={styles.carCard}
        onPress={() =>
          router.push({
            pathname: '/(auth)/book/[id]',
            params: { id: car._id },
          })
        }
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: car.carImageUrls?.[0] || 'https://source.unsplash.com/featured/?car' }}
          style={styles.carImage}
        />

        {car.views > 50 && (
          <View style={styles.popularBadge}>
            <MaterialIcons name="local-fire-department" size={14} color={Colors.white} />
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.heartButton}
          onPress={() => onToggleSave(car._id)}
        >
          <MaterialIcons 
            name={isSaved ? "favorite" : "favorite-border"} 
            size={22} 
            color={isSaved ? Colors.error : Colors.white} 
          />
        </TouchableOpacity>

        <View style={styles.carDetails}>
          <View style={styles.carHeader}>
            <Text style={styles.carName}>
              {car.carYear} {car.carMake} {car.carModel}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>${car.price}</Text>
              <Text style={styles.priceSubtext}>/day</Text>
            </View>
          </View>

          <View style={styles.carFeatures}>
            {car.transmission && (
              <View style={styles.feature}>
                <MaterialIcons name="settings" size={14} color={Colors.gray} />
                <Text style={styles.featureText}>{car.transmission}</Text>
              </View>
            )}

            {car.fuelType && (
              <View style={styles.feature}>
                <MaterialIcons name="local-gas-station" size={14} color={Colors.gray} />
                <Text style={styles.featureText}>{car.fuelType}</Text>
              </View>
            )}

            <View style={styles.feature}>
              <Ionicons name="eye-outline" size={14} color={Colors.gray} />
              <Text style={styles.featureText}>{car.views} views</Text>
            </View>
          </View>

          {car.ownerDetails && (
            <View style={styles.ownerDetails}>
              {car.ownerDetails.imageUrl ? (
                <Image source={{ uri: car.ownerDetails.imageUrl }} style={styles.ownerImage} />
              ) : (
                <View style={styles.ownerImagePlaceholder}>
                  <Text style={styles.ownerInitial}>{car.ownerDetails.name.charAt(0)}</Text>
                </View>
              )}

              <View style={styles.ownerInfo}>
                <Text style={styles.ownerLabel}>Hosted by</Text>
                <Text style={styles.ownerName}>{car.ownerDetails.name}</Text>
              </View>

              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={14} color={Colors.yellow} />
                <Text style={styles.ratingText}>{car.ownerDetails.rating || 4.5}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => (
  <View style={styles.emptyStateContainer}>
    <Ionicons name="car-sport-outline" size={80} color={Colors.gray} />
    <Text style={styles.emptyStateTitle}>No cars found</Text>
    <Text style={styles.emptyStateText}>
      Try adjusting your search or filters to find more options
    </Text>
    <TouchableOpacity style={styles.resetButton} onPress={onReset}>
      <Text style={styles.resetButtonText}>Reset All Filters</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: Colors.black,
  },
  suggestionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: Colors.black,
  },
  suggestionType: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.gray,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  filtersRow: {
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  filterContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedFilterPill: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: Colors.gray,
    marginRight: 4,
  },
  activeFilterPillText: {
    color: Colors.white,
  },
  selectedFilterPillText: {
    color: Colors.primary,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearFilterText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: Colors.white,
  },
  expandedFilterContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  selectedFilterOption: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: Colors.black,
  },
  selectedFilterOptionText: {
    color: Colors.primary,
    fontFamily: 'DMSans_500Medium',
  },
  allFiltersContainer: {
    paddingVertical: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    color: Colors.black,
    marginBottom: 12,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOptionSmall: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: Colors.gray,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: Colors.primary,
    marginLeft: 4,
  },
  carCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  carImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    marginLeft: 4,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carDetails: {
    padding: 16,
  },
  carHeader: {
    marginBottom: 12,
  },
  carName: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: Colors.black,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: Colors.primary,
  },
  priceSubtext: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: Colors.gray,
    marginLeft: 2,
  },
  carFeatures: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
    paddingBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: Colors.gray,
    marginLeft: 4,
  },
  ownerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ownerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  ownerImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ownerInitial: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: 'DMSans_700Bold',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: Colors.gray,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: Colors.black,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    color: Colors.black,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: Colors.gray,
    marginTop: 16,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
  },
});

export default SearchScreen;