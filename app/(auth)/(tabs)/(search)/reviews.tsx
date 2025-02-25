import React from "react";
import { View,ScrollView,Text,StyleSheet,TouchableOpacity,TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ReviewScreen(){
    return(
            <ScrollView contentContainerStyle={styles.container}>

                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>4.0</Text>
                    <View style={styles.stars}>
                        <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                        <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                        <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                        <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                        <MaterialIcons name="star" color={'grey'} size={20}></MaterialIcons>
                    </View>
                    <Text style={{color:'grey',fontFamily:'DMSans_700Bold'}}>Based on 5 reviews</Text>
                </View>
                <ScrollView contentContainerStyle={{width:'100%',borderTopWidth:1,padding:20}} >
                    <View style={styles.reviewContainer}>
                        <View style={styles.upperReview}>
                            <View style={{flexDirection:'row'}}>
                                <MaterialIcons name="account-circle" size={40}></MaterialIcons>
                                <View style={{alignItems:'baseline'}}>
                                    <Text style={{fontFamily:'DMSans_700Bold'}}>Sammy Kitonga</Text>
                                    <View style={styles.stars}>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'grey'} ></MaterialIcons>
                                        <Text style={{fontFamily:'DMSans_700Bold',marginLeft:10}}>4.0</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={{color:'grey',fontFamily:'DMSans_700Bold'}}>2 days ago</Text>
                        </View>
                        <View style={styles.bottomReview}>
                            <Text style={{color:'grey',minHeight:'auto',fontFamily:'DMSans_700Bold'}}>
                                The cars is amazing. I like that i didnt have to take it out for maintenance or had any underlying issues that i had to deal with.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.reviewContainer}>
                        <View style={styles.upperReview}>
                            <View style={{flexDirection:'row'}}>
                                <MaterialIcons name="account-circle" size={40}></MaterialIcons>
                                <View style={{alignItems:'baseline'}}>
                                    <Text style={{fontFamily:'DMSans_700Bold'}}>Sammy Kitonga</Text>
                                    <View style={styles.stars}>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'grey'} ></MaterialIcons>
                                        <Text style={{fontFamily:'DMSans_700Bold',marginLeft:10}}>4.0</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={{color:'grey',fontFamily:'DMSans_700Bold'}}>2 days ago</Text>
                        </View>
                        <View style={styles.bottomReview}>
                            <Text style={{color:'grey',minHeight:'auto',fontFamily:'DMSans_700Bold'}}>
                                The cars is amazing. I like that i didnt have to take it out for maintenance or had any underlying issues that i had to deal with.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.reviewContainer}>
                        <View style={styles.upperReview}>
                            <View style={{flexDirection:'row'}}>
                                <MaterialIcons name="account-circle" size={40}></MaterialIcons>
                                <View style={{alignItems:'baseline'}}>
                                    <Text style={{fontFamily:'DMSans_700Bold'}}>Sammy Kitonga</Text>
                                    <View style={styles.stars}>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'grey'} ></MaterialIcons>
                                        <Text style={{fontFamily:'DMSans_700Bold',marginLeft:10}}>4.0</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={{color:'grey',fontFamily:'DMSans_700Bold'}}>2 days ago</Text>
                        </View>
                        <View style={styles.bottomReview}>
                            <Text style={{color:'grey',minHeight:'auto',fontFamily:'DMSans_700Bold'}}>
                                The cars is amazing. I like that i didnt have to take it out for maintenance or had any underlying issues that i had to deal with.
                            </Text>
                        </View>
                    </View>


                    <View style={styles.reviewContainer}>
                        <View style={styles.upperReview}>
                            <View style={{flexDirection:'row'}}>
                                <MaterialIcons name="account-circle" size={40}></MaterialIcons>
                                <View style={{alignItems:'baseline'}}>
                                    <Text style={{fontFamily:'DMSans_700Bold'}}>Sammy Kitonga</Text>
                                    <View style={styles.stars}>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'grey'} ></MaterialIcons>
                                        <Text style={{fontFamily:'DMSans_700Bold',marginLeft:10}}>4.0</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={{color:'grey',fontFamily:'DMSans_700Bold'}}>2 days ago</Text>
                        </View>
                        <View style={styles.bottomReview}>
                            <Text style={{color:'grey',minHeight:'auto',fontFamily:'DMSans_700Bold'}}>
                                The cars is amazing. I like that i didnt have to take it out for maintenance or had any underlying issues that i had to deal with.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.reviewContainer}>
                        <View style={styles.upperReview}>
                            <View style={{flexDirection:'row'}}>
                                <MaterialIcons name="account-circle" size={40}></MaterialIcons>
                                <View style={{alignItems:'baseline'}}>
                                    <Text style={{fontFamily:'DMSans_700Bold'}}>Sammy Kitonga</Text>
                                    <View style={styles.stars}>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'#e3b614'}></MaterialIcons>
                                        <MaterialIcons name="star" color={'grey'} ></MaterialIcons>
                                        <Text style={{fontFamily:'DMSans_700Bold',marginLeft:10}}>4.0</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={{color:'grey',fontFamily:'DMSans_700Bold'}}>2 days ago</Text>
                        </View>
                        <View style={styles.bottomReview}>
                            <Text style={{color:'grey',minHeight:'auto',fontFamily:'DMSans_700Bold'}}>
                                The cars is amazing. I like that i didnt have to take it out for maintenance or had any underlying issues that i had to deal with.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
                <TouchableOpacity onPress={()=>{
                    router.push('/(auth)/(search)/addReview')

                }} style={styles.addReview}>
                    <Text style={{fontFamily:'DMSans_700Bold',color:'white'}}>Write a review</Text>
                </TouchableOpacity>
            </ScrollView>
    );
}

const styles=StyleSheet.create({
    container:{
        alignItems:'center',
        padding:10,
        position:'relative'
    },
    ratingContainer:{
        alignItems:'center',
        // borderBottomWidth:1,
        paddingBottom:10
    },
    rating:{
        fontSize:40,
        // fontWeight:'bold',
        fontFamily:'DMSans_700Bold'
    },
    stars:{
        flexDirection:'row'
    },
    reviewContainer:{
        minWidth:'100%',
        minHeight:100,
        height:'auto',
        // borderWidth:1,
        borderRadius:15,
        borderColor:'grey',
        // borderTopWidth:1
        padding:10,
        backgroundColor:'white',
        margin:10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    upperReview:{
        flexDirection:'row',
        justifyContent:'space-between'
    },
    bottomReview:{
        alignItems:'center'
    },
    addReview:{
       width:'70%',
    //    alignItems:'center',
       justifyContent:'center',
    //    backgroundColor:'lightblue',
    //    borderRadius:20,
       height:50,
       position:'relative',
       bottom:0,
       backgroundColor: '#007AFF',
       borderRadius: 12,
       paddingVertical: 16,
       alignItems: 'center',
       marginBottom: 10,

    }
})