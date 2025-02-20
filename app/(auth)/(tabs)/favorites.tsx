import React from 'react';
import { View, Text, StyleSheet,ScrollView, TouchableOpacity, TextInput } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        <View style={styles.searchBar}>
          <MaterialIcons name='search' size={15}></MaterialIcons>
          <TextInput style={{width:'90%'}} placeholder='Search messages'></TextInput>
        </View>
        <TouchableOpacity style={styles.notifications}>
            <MaterialIcons name='notification-important' size={40} color={'#007AFF'}></MaterialIcons>
            <MaterialIcons style={styles.notificationNumber} name='warning'></MaterialIcons>
        </TouchableOpacity>
      </View>

      
      <View style={styles.upperBar}>
        <ScrollView contentContainerStyle={styles.filterContainer} horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterTxt}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterTxt}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterTxt}>Read</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.filter}>
            <Text style={styles.filterTxt}>Read</Text>
          </TouchableOpacity> */}
        </ScrollView>

        
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.messageContainer}>
        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
              <Text style={styles.username}> Sammy</Text>
              <Text  style={styles.userTxt}>Hello ...</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>



        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
              <Text style={styles.username}> James  Mwololo</Text>
              <Text  style={styles.userTxt}>Come pickup your car today</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>


        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
               <Text style={styles.username}>Kerry Luvai</Text>
              <Text  style={styles.userTxt}>My car ran into an issue. What ...</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>


        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
              <Text style={styles.username}> Joab Bodo</Text>
              <Text  style={styles.userTxt}>Hello, i would like to rent your Toyota...</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
              <Text style={styles.username}> Joab Bodo</Text>
              <Text  style={styles.userTxt}>Hello, i would like to rent your Toyota...</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
              <Text style={styles.username}> Joab Bodo</Text>
              <Text  style={styles.userTxt}>Hello, i would like to rent your Toyota...</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
              <Text style={styles.username}> Joab Bodo</Text>
              <Text  style={styles.userTxt}>Hello, i would like to rent your Toyota...</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageBox}>
          <View style={styles.Left}>
            <MaterialIcons size={60} name='account-circle'></MaterialIcons>
            <View style={styles.text}>
              <Text style={styles.username}> Joab Bodo</Text>
              <Text  style={styles.userTxt}>Hello, i would like to rent your Toyota...</Text>
            </View>
          </View>

          <View style={styles.Right}>
              <Text style={styles.time}> 10.13</Text>
              <MaterialIcons size={30} name='notifications-on' color={'#007AFF'}></MaterialIcons>
          </View>
        </TouchableOpacity>
        


        
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    padding:5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageContainer:{
      width:'100%',
      // padding:5
  },
  messageBox:{
      flexDirection:'row',
      height:80,
      width:'100%',
      // backgroundColor:'white',
      borderRadius:10,
      padding:10,
      margin:10,
      alignItems:'center',
      justifyContent:'space-between',
      // paddingRight:10
  },
  text:{
      justifyContent:'flex-start'
  },
  username:{
    fontSize:20,
    fontFamily:'DMSans_700Bold'
  },
  userTxt:{
    fontSize:12,
    fontFamily:'DMSans_700Bold'
  },
  Left:{
    flexDirection:'row',
    alignItems:'center'
  },
  Right:{
    justifyContent:'flex-end'
  },
  filter:{
    borderRadius:15,
    backgroundColor:'#007AFF',
    height:30,
    padding:6,
    justifyContent:'center',
    alignItems:'center',
    
  },
  filterContainer:{
    gap:5,
    // justifyContent:'flex-start'
    // height:20,

  },
  filterTxt:{
      fontSize:16,
      fontFamily:'DMSans_700Bold',
      color:'white'

  },
  upperBar:{
    flexDirection:'row'
  },
  notifications:{
    position:'relative'
  },
  notificationNumber:{
    position:'absolute',
    right:5,
    top:0

  },
  time:{
      fontFamily:'DMSans_700Bold'
  },
  searchBar:{
      width:'80%',
      height:40,
      backgroundColor:'grey',
      borderRadius:16,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      padding:5,
      margin:10
  }
});
