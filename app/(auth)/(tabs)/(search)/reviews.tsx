import React from "react";
import { View,ScrollView,Text,StyleSheet,TouchableOpacity,TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ReviewScreen(){
    return(
            <View style={styles.container}>

                <View style={styles.ratingWrapper}>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.rating}>4.0</Text>
                        <View style={styles.stars}>
                            <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                            <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                            <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                            <MaterialIcons name="star" color={'#e3b614'} size={20}></MaterialIcons>
                            <MaterialIcons name="star" color={'grey'} size={20}></MaterialIcons>
                        </View>
                        <Text style={{color:'grey',fontFamily:'DMSans_700Bold'}}>Based on 10 reviews</Text>
                    </View>
                    <View style={styles.ratingChartContainer}>
                        {[
                            { stars: 5, count: 5 },
                            { stars: 4, count: 0 },
                            { stars: 3, count: 5 },
                            { stars: 2, count: 0 },
                            { stars: 1, count: 0 }
                        ].map(({ stars, count }) => (
                            <View key={stars} style={styles.ratingRow}>
                                <Text style={styles.starLabel}>{stars} ★</Text>
                                <View style={styles.barBackground}>
                                    <View style={[styles.barFill, { width: `${(count / 5) * 100}%` }]} />
                                </View>
                                <Text style={styles.starLabel}>{count}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <ScrollView contentContainerStyle={{width:'100%',padding:20,alignItems:'center'}} >
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
                <View style={styles.btnContainer}>
                    <TouchableOpacity onPress={()=>{
                        router.push('/(auth)/(search)/addReview')
                    }} style={styles.addReview}>
                        <Text style={{fontFamily:'DMSans_700Bold',color:'white'}}>Write a review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{
                        router.push('/(auth)/(search)/addReview')
                    }} style={[styles.addReview,{backgroundColor:'lightgreen'}]}>
                        <Text style={{fontFamily:'DMSans_700Bold',color:'black'}}>Book now</Text>
                    </TouchableOpacity>
                </View>
            </View>
    );
}

const styles=StyleSheet.create({
    container:{
        alignItems:'center',
        // padding:10,
        position:'relative',
        flex:1,
        
    },
    ratingWrapper:{
        backgroundColor: 'white', 
        padding: 15,
        borderBottomLeftRadius: 20, 
        borderBottomRightRadius: 20,
        borderBottomColor:'grey',
        borderBottomWidth:1, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%',
    },
    ratingContainer:{
        alignItems:'center',
        // borderBottomWidth:1,
        paddingBottom:10,
        
    },
    rating:{
        fontSize:40,
        // fontWeight:'bold',
        fontFamily:'DMSans_700Bold'
    },
    stars:{
        flexDirection:'row'
    },
    ratingChartContainer: {
        width: '90%',
        marginTop: 10,
        marginBottom:10,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2
    },
    starLabel: {
        width: 30,
        textAlign: 'right',
        fontFamily: 'DMSans_700Bold',
        color: 'grey'
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginHorizontal: 5
    },
    barFill: {
        height: '100%',
        backgroundColor: '#e3b614',
        borderRadius: 5
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
        margin:5,
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
       width:'100%',
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

    },
    btnContainer:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        padding:2
    }
})