// CarsScreen.tsx
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { BlurView } from 'expo-blur';
import { Id } from '@/convex/_generated/dataModel';
import type { EdgeInsets } from 'react-native-safe-area-context';

export type CarStatus = 'active' | 'inactive' | 'pending';

export interface Car {
  _id: Id<'posts'>;
  carMake: string;
  carModel: string;
  carYear: string;
  carLocation?: string;
  rentRange?: string;
  carDescription?: string;
  carImageUrls: string[];
  features: string[];
  status: CarStatus;
  views: number;
  posterId: Id<'users'>;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
  createdAt: string;
  updatedAt: string;
}

const Header: React.FC<{ insets: EdgeInsets }> = ({ insets }) => (
  <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
    <TouchableOpacity 
      style={styles.backButton}
      onPress={() => router.back()}
    >
      <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>My Cars</Text>
    <TouchableOpacity 
      style={styles.addButton}
      onPress={() => router.push("/(auth)/(modal)/create")}
    >
      <MaterialCommunityIcons name="plus" size={24} color="#007AFF" />
    </TouchableOpacity>
  </View>
);

const EmptyState: React.FC = () => (
  <View style={styles.emptyCarsContainer}>
    <MaterialCommunityIcons name="car-outline" size={80} color="#CCCCCC" />
    <Text style={styles.emptyTitleText}>No Cars Listed</Text>
    <Text style={styles.emptySubtitleText}>List your car to start earning money today!</Text>
    <TouchableOpacity 
      style={styles.addCarButton}
      onPress={() => router.push("/(auth)/(modal)/create")}
    >
      <Text style={styles.addCarButtonText}>Add Your First Car</Text>
    </TouchableOpacity>
  </View>
);

const CarFeatureTag: React.FC<{ feature: string }> = ({ feature }) => (
  <View style={styles.featureTag}>
    <Text style={styles.featureText}>{feature}</Text>
  </View>
);

const DetailItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.detailItem}>
    <MaterialCommunityIcons name={icon as any} size={16} color="#666" />
    <Text style={styles.detailText}>{text}</Text>
  </View>
);

const ActionButtons: React.FC<{
  car: Car;
  onEdit: () => void;
  onStatusToggle: () => void;
  onDelete: () => void;
}> = ({ car, onEdit, onStatusToggle, onDelete }) => (
  <View style={styles.actionButtonsContainer}>
    <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
      <MaterialCommunityIcons name="pencil" size={18} color="#007AFF" />
      <Text style={styles.actionButtonText}>Edit</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: car.status === 'active' ? '#FFF0F0' : '#F0FFF0' }]}
      onPress={onStatusToggle}
    >
      <MaterialCommunityIcons 
        name={car.status === 'active' ? "pause-circle" : "play-circle"} 
        size={18} 
        color={car.status === 'active' ? "#FF3B30" : "#34C759"} 
      />
      <Text style={[styles.actionButtonText, { color: car.status === 'active' ? "#FF3B30" : "#34C759" }]}>
        {car.status === 'active' ? 'Pause' : 'Activate'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: '#FFE5E5' }]}
      onPress={onDelete}
    >
      <MaterialCommunityIcons name="delete" size={18} color="#FF3B30" />
      <Text style={[styles.actionButtonText, { color: "#FF3B30" }]}>Delete</Text>
    </TouchableOpacity>
  </View>
);

const CarCard: React.FC<{
  car: Car;
  onNavigateToDetails: (carId: Id<'posts'>) => void;
  onNavigateToEdit: (carId: Id<'posts'>) => void;
  onStatusToggle: (car: Car) => Promise<void>;
  onDelete: (car: Car) => void;
}> = ({ car, onNavigateToDetails, onNavigateToEdit, onStatusToggle, onDelete }) => {
  const getStatusColor = (status: CarStatus): string => {
    const statusColors = {
      active: '#34C759',
      inactive: '#FF9500',
      pending: '#007AFF'
    };
    return statusColors[status] || '#8E8E93';
  };

  return (
    <TouchableOpacity 
      style={styles.carCard}
      onPress={() => onNavigateToDetails(car._id)}
    >
      <View>
        <Image
          source={{ uri: car.carImageUrls[0] || 'https://via.placeholder.com/400x200?text=No+Image' }}
          style={styles.carImage}
        />
        
        <View style={[styles.statusRibbon, { backgroundColor: getStatusColor(car.status) }]}>
          <Text style={styles.statusRibbonText}>
            {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.carInfo}>
        <View style={styles.carHeader}>
          <Text style={styles.carName}>{car.carMake} {car.carModel} {car.carYear}</Text>
          <View style={styles.statContainer}>
            <MaterialCommunityIcons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{car.views}</Text>
          </View>
        </View>
        
        <View style={styles.carDetails}>
          <DetailItem icon="map-marker" text={car.carLocation || 'Location unavailable'} />
          <DetailItem icon="currency-usd" text={car.rentRange || '$0/day'} />
        </View>

        <View style={styles.carFeatures}>
          {car.features.slice(0, 3).map((feature, index) => (
            <CarFeatureTag key={index} feature={feature} />
          ))}
          {car.features.length > 3 && (
            <CarFeatureTag feature={`+${car.features.length - 3} more`} />
          )}
        </View>

       
        <View style={styles.actionButtonsContainer}>
          <Pressable 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation();
              onNavigateToEdit(car._id);
            }}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#007AFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, { backgroundColor: car.status === 'active' ? '#FFF0F0' : '#F0FFF0' }]}
            onPress={(e) => {
              e.stopPropagation();
              onStatusToggle(car);
            }}
          >
            <MaterialCommunityIcons 
              name={car.status === 'active' ? "pause-circle" : "play-circle"} 
              size={18} 
              color={car.status === 'active' ? "#FF3B30" : "#34C759"} 
            />
            <Text style={[styles.actionButtonText, { color: car.status === 'active' ? "#FF3B30" : "#34C759" }]}>
              {car.status === 'active' ? 'Pause' : 'Activate'}
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { backgroundColor: '#FFE5E5' }]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(car);
            }}
          >
            <MaterialCommunityIcons name="delete" size={18} color="#FF3B30" />
            <Text style={[styles.actionButtonText, { color: "#FF3B30" }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CarsScreen: React.FC = () => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  
  const convexUser = useQuery(api.users.current);
  const userCars = useQuery(api.post.getUserCars, { 
    userId: convexUser?._id ?? ""
  }) as Car[] | undefined;
  
  const updatePost = useMutation(api.post.updatePost);
  const deletePost = useMutation(api.post.deletePost);

  const toggleCarStatus = useCallback(async (car: Car) => {
    try {
      const newStatus = car.status === 'active' ? 'inactive' : 'active';
      await updatePost({
        postId: car._id,
        updates: { status: newStatus }
      });
      Alert.alert(
        "Status Updated", 
        `Your ${car.carMake} ${car.carModel} is now ${newStatus}.`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update car status. Please try again.");
    }
  }, [updatePost]);

  const handleDeleteCar = useCallback((car: Car) => {
    Alert.alert(
      "Delete Car",
      `Are you sure you want to delete your ${car.carMake} ${car.carModel}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost({ postId: car._id });
              Alert.alert("Success", "Car listing deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete car. Please try again.");
            }
          }
        }
      ]
    );
  }, [deletePost]);

  const navigateToCarDetails = useCallback((carId: Id<'posts'>) => {
    router.push({
      pathname: "/(auth)/(tabs)/(profile)/car-details/[id]",
      params: { id: carId }
    });
  }, []);

  const navigateToEditCar = useCallback((carId: Id<'posts'>) => {
    router.push({
      pathname: "/(auth)/(tabs)/(profile)/edit-car/[id]",
      params: { id: carId }
    });
  }, []);

  if (!fontsLoaded || userCars === undefined) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, fontFamily: 'DMSans_400Regular' }}>Loading your cars...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Header insets={insets} />
        
        {userCars.length > 0 ? (
          <View style={styles.carsContainer}>
            {userCars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                onNavigateToDetails={navigateToCarDetails}
                onNavigateToEdit={navigateToEditCar}
                onStatusToggle={toggleCarStatus}
                onDelete={handleDeleteCar}
              />
            ))}
          </View>
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 8,
  },
  emptyCarsContainer: {
    flex: 1,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitleText: {
    fontSize: 22,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptySubtitleText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addCarButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addCarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },
  carsContainer: {
    padding: 20,
    gap: 16,
  },
  carCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  carImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  statusRibbon: {
    position: 'absolute',
    top: 16,
    left: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingLeft: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRibbonText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
  },
  moreButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carInfo: {
    padding: 16,
    gap: 12,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    flex: 1,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  carDetails: {
    gap: 8,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  carFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  featureTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F8FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#007AFF',
  },
  modalOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  blurBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalDismiss: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  actionMenu: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionMenuTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  actionMenuItemText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  actionMenuCancel: {
    justifyContent: 'center',
    marginTop: 16,
  },
  actionMenuCancelText: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
});

export default CarsScreen;