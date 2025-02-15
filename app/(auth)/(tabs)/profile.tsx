import React from 'react';
import { ScrollView,View, Text, StyleSheet, Button, Alert,TouchableOpacity, Settings } from 'react-native';
import { useUser, useAuth }  from '@clerk/clerk-expo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';




export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser()
  
  if (!isLoaded || !isSignedIn) {
    return (
    <View style={styles.container}>
      <Text>Log in</Text>
      <Text>Sign up</Text>
    </View>)
  }
  return (
    // <View style={styles.container}>
    //   <MaterialIcons name="account-circle" size={50} color="black" />
     
    //   <Text style={styles.title}>
    //     Hello, {user.firstName} {user.lastName} 
    //   </Text>
    //   <Button 
    //     title='Log out'
    //     onPress={() => signOut()}
    //     color="#ed1109"
    //   ></Button>
    // </View>

    <ScrollView>
      {/* <View style={styles.userDetail}>
      <View style={styles.Left}>
        <MaterialIcons name='account-circle' size={70}></MaterialIcons>
        <View style={styles.emailName}>
          <Text style={{fontWeight:'bold'}}>Sammy Kitonga</Text>
          <Text style={{color:'grey'}}>smusangi54@gmail.com</Text>
        </View>
      </View>

      <View style={styles.Right}>
        <TouchableOpacity>
          <View style={styles.editProfile}>
            <MaterialIcons color={'grey'} name='edit' size={25}></MaterialIcons>
            <Text style={{color:'grey'}}>Edit Profile</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View> */}


    <View style={styles.userDetail}>
          <Text style={{fontSize:30,fontWeight:'bold'}}>{user.firstName} {user.lastName}</Text>
          <Text style={{fontSize:15}}>smusangi54@gmail.com</Text>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <View style={{padding:5}}>
              <MaterialIcons style={styles.accountIcon} size={100} name='account-circle'></MaterialIcons>
              <TouchableOpacity>
                <View
                style={{
                  position:'absolute',
                  bottom:0,
                  right:20,
                  // top:1,
                  zIndex:9999
                }}
                >
                 <MaterialIcons color={'white'} name='photo-camera' size={25}></MaterialIcons>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>

          <View style={styles.editProfile}>
            <MaterialIcons color={'#505152'} name='edit'  size={25}></MaterialIcons>
            <Text style={{color:'#505152'}}>Edit Profile</Text>
          </View>
        </TouchableOpacity>
          </View>



          <View style={styles.ratingContainer}>
                <Text style={{color:'white',fontSize:15}}>Rating: 4.5 (20)</Text>
                <MaterialIcons name='star-rate' size={22} color={'yellow'}></MaterialIcons>
          </View>

          <View style={styles.rentContainer}>
                <Text style={{color:'white',fontSize:15}}>Cars rented: 15</Text>
                <Text style={{color:'white',fontSize:15,borderLeftWidth:1,borderColor:'white',}}> Cars rented out: 6</Text>
          </View>
    </View>


      <View style={styles.settings}>
        {/* <Text style={styles.header}>General</Text> */}

        <TouchableOpacity>
          <View style={styles.setting}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialIcons style={styles.icons} color={'grey'} name='bookmark' size={30}></MaterialIcons>
              <Text>Bookmarked cars</Text>
            </View>
            <MaterialIcons color={'grey'} name='arrow-right' size={40}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.setting}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialIcons style={styles.icons} color={'grey'} name='alarm' size={30}></MaterialIcons>
              <Text>Bookings</Text>
            </View>
            <MaterialIcons color={'grey'} name='arrow-right' size={40}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.setting}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialIcons style={styles.icons} color={'grey'} name='settings' size={30}></MaterialIcons>
              <Text>Settings</Text>
            </View>
            <MaterialIcons color={'grey'} name='arrow-right' size={40}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.setting}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialIcons style={styles.icons} color={'grey'} name='label-important' size={30}></MaterialIcons>
              <Text>Verify ID</Text>
            </View>
            <MaterialIcons color={'grey'} name='arrow-right' size={40}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.setting}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialIcons style={styles.icons} color={'grey'}  name='headphones' size={30}></MaterialIcons>
              <Text>Help support</Text>
            </View>
            <MaterialIcons color={'grey'} name='arrow-right' size={40}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={styles.setting}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialIcons style={styles.icons} color={'grey'} name='supervised-user-circle' size={30}></MaterialIcons>
              <Text>Invite friends</Text>
            </View>
            <MaterialIcons color={'grey'} name='arrow-right' size={40}></MaterialIcons>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>signOut()}>
          <View style={[styles.setting,styles.logout]}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialIcons style={[styles.icons, {color:'red'}]} color={'grey'} name='logout' size={30}></MaterialIcons>
              <Text style={{color:'red'}}>Log out</Text>
            </View>
            {/* <MaterialIcons color={'grey'} name='arrow-right' size={40}></MaterialIcons> */}
          </View>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderColor: '#20232a',
    color: '#20232a',
    // padding:15
  },
  title: {
    fontSize: 24,
    padding: 24,
  },
  userDetails:{
    flex:1,
    
  },
  settings:{
    flex:2,
    // backgroundColor:''
    // borderWidth:1,
    borderRadius:20
  },
  userDetail:{
    // flexDirection:'row',
    alignItems:'center',
    minWidth:'100%',
    justifyContent:'space-between',
    // gap:50
    // borderWidth:1,
    // shadow:,
    // backgroundColor:'white',
    marginBottom:1,
    // borderRadius:20
    backgroundColor:'#65b8e6',
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
    padding:20

  },
  rentContainer:{
    flexDirection:'row',
    width:'80%',
    backgroundColor:'#505152',
    height:'auto',
    borderRadius:20,
    alignItems:'flex-start',
    justifyContent:'center',
    padding:10,
    gap:5

  },
  ratingContainer:{
      flexDirection:'row',
      justifyContent:'center',
      // alignItems:'center',
      gap:5,
      width:'80%',
      backgroundColor:'#505152',
      borderRadius:20,
      height:'auto',
      padding:10,
      margin:10
      // color:'white'
  }
  ,
  accountIcon:{
    position:'relative'
  },
  userImage:{

  },
  emailName:{
    justifyContent:'center'
  },
  editProfile:{
      justifyContent:'center',
      alignItems:'center'
      
  },
  header:{
    fontSize:17,
    fontWeight:'bold'
  },
  setting:{
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-between',
    // alignContent:'center',
    alignItems:'center',
    padding:15,
    // borderTopWidth:,
    borderBottomWidth:1
  },
  logout:{
      color:'red',
      borderColor:'red'
  },
  Left:{
    flexDirection:'row',
    gap:10
  },
  Right:{
      alignItems:'center',
      justifyContent:'center'
  },
  icons:{
    // borderWidth:1,
    borderRadius:30,
    // padding:5,
    marginRight:5
  }
});
