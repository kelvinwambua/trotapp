import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

//@/assets/images/car.jpg
export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      {/* Add search functionality here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
    width:150,
    justifyContent:'center',
    alignItems:'center'
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
    height:104 ,
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
    height: 130,
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
  ratingContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewText:{
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: 'bold',
  },
});
