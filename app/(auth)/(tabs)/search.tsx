import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const carImages = [
  'https://source.unsplash.com/random/300x200?car',
  'https://source.unsplash.com/featured/?sports-car',
  'https://source.unsplash.com/featured/?luxury-car',
  'https://source.unsplash.com/featured/?electric-car',
];

const placeholderImages = [
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/150',
];

const carData = [
  { id: 1, name: 'Tesla Model S', type: 'Electric', brand: 'Tesla', price: '100k+', capacity: '5', fuel: 'Electric', image: 'https://source.unsplash.com/featured/?tesla' },
  { id: 2, name: 'BMW M3', type: 'Sports', brand: 'BMW', price: '30k-50k', capacity: '4', fuel: 'Petrol', image: 'https://source.unsplash.com/featured/?bmw' },
  { id: 3, name: 'Ford Mustang', type: 'Sports', brand: 'Ford', price: '30k-50k', capacity: '4', fuel: 'Petrol', image: 'https://source.unsplash.com/featured/?mustang' },
  { id: 4, name: 'Toyota Corolla', type: 'Sedan', brand: 'Toyota', price: '10k-30k', capacity: '5', fuel: 'Petrol', image: 'https://source.unsplash.com/featured/?toyota' },

];

export default function SearchScreen() {

  useEffect(() => {
    setTimeout(() => {}, 2000); 
  }, []);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [filteredCars,setFilteredCars]=useState(carData);

  const carTypes = ['SUV', 'Sedan', 'Hatchback', 'Electric', 'Sports'];
  const carBrands = ['Toyota', 'BMW', 'Tesla', 'Ford', 'Mercedes'];
  const priceRanges = ['Less than 10k', '10k-30k', '30k-50k', '100k+'];
  const sittingCapacities = ['2', '4', '5', '7+'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

  
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
    setSelectedCapacity(null);
    setSelectedFuel(null);
  };

  useEffect(() => {
    filterCars();
  }, [searchQuery, selectedType, selectedBrand, selectedPrice, selectedCapacity, selectedFuel]);

  const filterCars = () => {
    let results = carData.filter(car =>
      (!selectedType || car.type === selectedType) &&
      (!selectedBrand || car.brand === selectedBrand) &&
      (!selectedPrice || car.price === selectedPrice) &&
      (!selectedCapacity || car.capacity === selectedCapacity) &&
      (!selectedFuel || car.fuel === selectedFuel) &&
      (searchQuery === '' || car.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredCars(results);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="car" size={32} color="#007AFF" />
        <Text style={styles.logo}>Trot</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle" size={32} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Location"
        style={styles.input}
        placeholderTextColor="#999"
      />

      <Text style={styles.infoText}>100+ cars readily available for you today!!!</Text>

      <TouchableOpacity 
        style={styles.exploreButton} 
        onPress={() => setFilterModalVisible(true)}
      >
        <Text style={styles.exploreText}>Search</Text>
      </TouchableOpacity>

      
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Cars</Text>


            
            <TextInput
              style={styles.searchInput}
              placeholder="Search car by name"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            
            <Text style={styles.filterLabel}>Car Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {carTypes.map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[
                    styles.filterButton, 
                    selectedType === type && styles.selectedFilterButton
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={styles.filterText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            
            <Text style={styles.filterLabel}>Brand</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {carBrands.map((brand) => (
                <TouchableOpacity 
                  key={brand} 
                  style={[
                    styles.filterButton, 
                    selectedBrand === brand && styles.selectedFilterButton
                  ]}
                  onPress={() => setSelectedBrand(brand)}
                >
                  <Text style={styles.filterText}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            
            <Text style={styles.filterLabel}>Price Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {priceRanges.map((price) => (
                <TouchableOpacity 
                  key={price} 
                  style={[
                    styles.filterButton, 
                    selectedPrice === price && styles.selectedFilterButton
                  ]}
                  onPress={() => setSelectedPrice(price)}
                >
                  <Text style={styles.filterText}>{price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            
            <Text style={styles.filterLabel}>Sitting Capacity</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sittingCapacities.map((capacity) => (
                <TouchableOpacity 
                  key={capacity} 
                  style={[
                    styles.filterButton, 
                    selectedCapacity === capacity && styles.selectedFilterButton
                  ]}
                  onPress={() => setSelectedCapacity(capacity)}
                >
                  <Text style={styles.filterText}>{capacity}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            
            <Text style={styles.filterLabel}>Fuel Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {fuelTypes.map((fuel) => (
                <TouchableOpacity 
                  key={fuel} 
                  style={[
                    styles.filterButton, 
                    selectedFuel === fuel && styles.selectedFilterButton
                  ]}
                  onPress={() => setSelectedFuel(fuel)}
                >
                  <Text style={styles.filterText}>{fuel}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.showResultsButton} 
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.showResultsText}>Show Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <ScrollView showsVerticalScrollIndicator style={styles.resultsContainer}>
        {filteredCars.length > 0 ? (
          filteredCars.map(car => (
            <View key={car.id} style={styles.resultItem}>
              <Image source={{ uri: car.image }} style={styles.carImage} />
              <View>
                <Text style={styles.carName}>{car.name}</Text>
                <Text style={styles.carDetails}>{car.brand} - {car.type}</Text>
                <Text style={styles.carDetails}>{car.capacity} Seater - {car.fuel}</Text>
                <Text style={styles.carDetails}>Price: {car.price}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noResults}>No cars found matching your filters.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  exploreText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor:'#000',
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.2,
    shadowRadius:6,
    elevation:8
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  filterButton: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 12, 
    paddingHorizontal: 20,
    borderRadius: 24, 
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  selectedFilterButton: {
    backgroundColor: '#007AFF',
  },
  showResultsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
  },
  showResultsText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  filterText:{
    fontSize: 16,
    fontWeight: 'condensedBold',
    marginTop: 10,
    marginBottom: 5,
  },
  buttonRow:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 20,    
  },
  clearButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 14,
    borderRadius: 12,
    width: '45%',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  carDetails:{
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    height: 80,
  },
  resultsContainer:{
    marginTop:20,
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  noResults:{
    textAlign:'center',
    marginTop:20,
    color:'#666'
  },
  resultItem:{
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 104,
  },
  selectedResult: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F9FF',
  },
  carImage:{
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  carName:{
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },


});
