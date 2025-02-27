import React, { useState } from "react";
import { View,ScrollView,Text,StyleSheet,TouchableOpacity,TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ReviewScreen(){

    const [selectedTab,setSelectedTab]=useState('car')

    const carReviews = [
        { id: 1, name: "Sammy Kitonga", rating: 4, date: "2 days ago", text: "The car was amazing. No maintenance issues at all!" },
        { id: 2, name: "Jane Doe", rating: 5, date: "1 week ago", text: "Super smooth ride and well-maintained vehicle." },
        { id: 3, name: "Kevin Oketch", rating: 0, date: "yesterday", text: "The car was emitting a weired squeaky sound. Maybe you should have that addressed before renting out the car" },
        { id: 4, name: "Kerry Luvai", rating: 5, date: "2 weeks ago", text: "The car was amazing. Would highly recommend!!" },
        { id: 5, name: "John Doe", rating: 1, date: "4 hours ago", text: "The car was extremely poorly maintained when i got it!" },
    ];

    const userReviews = [
        { id: 1, name: "John Smith", rating: 5, date: "2 hours ago", text: "The renter was super helpful and whenever an issue came up, he was willing to walk me through i could resolve it." },
        { id: 2, name: "Joab Bodo", rating: 1, date: "3 days ago", text: "The renter was extremely rude!" },
        { id: 3, name: "Alice Brown", rating: 5, date: "5 days ago", text: "The rental experience was excellent. Highly recommend!" },

    ];

    const renderReviews = (reviews) => {
        return reviews.map((review) => (
            <View key={review.id} style={styles.reviewContainer}>
                <View style={styles.upperReview}>
                    <View style={{ flexDirection: 'row' }}>
                        <MaterialIcons name="account-circle" size={40} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontFamily: 'DMSans_700Bold' }}>{review.name}</Text>
                            <View style={styles.stars}>
                                {[...Array(5)].map((_, i) => (
                                    <MaterialIcons 
                                        key={i} 
                                        name="star" 
                                        color={i < review.rating ? '#e3b614' : 'grey'} 
                                    />
                                ))}
                                <Text style={{ fontFamily: 'DMSans_700Bold', marginLeft: 10 }}>{review.rating}.0</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={{ color: 'grey', fontFamily: 'DMSans_700Bold' }}>{review.date}</Text>
                </View>
                <View style={styles.bottomReview}>
                    <Text style={{ color: 'grey', fontFamily: 'DMSans_700Bold' }}>{review.text}</Text>
                </View>
            </View>
        ));
    };

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

            <View style={styles.toggleContainer}>
                <TouchableOpacity 
                    style={[styles.toggleButton, selectedTab === "car" && styles.activeTab]} 
                    onPress={() => setSelectedTab("car")}
                >
                    <Text style={[selectedTab==="car" ? styles.toggleText:styles.untoggleText ]}>Car Reviews</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.toggleButton, selectedTab === "user" && styles.activeTab]} 
                    onPress={() => setSelectedTab("user")}
                >
                    <Text style={[selectedTab==="user" ? styles.toggleText:styles.untoggleText ]}>Renter Reviews</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ width: '100%', padding: 20, alignItems: 'center' }}>
                {selectedTab === "car" ? renderReviews(carReviews) : renderReviews(userReviews)}
            </ScrollView>

                <View style={styles.btnContainer}>
                    <TouchableOpacity onPress={()=>{
                        router.push('/(auth)/(search)/addReview')
                    }} style={styles.addReview}>
                        <Text style={{fontFamily:'DMSans_700Bold',color:'white'}}>Write a review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{
                        router.push('/(auth)/(tabs)/book')
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

    toggleContainer: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
        marginVertical: 10,
    },
    toggleButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: "#ddd",
    },
    activeTab: {
        backgroundColor: "#007AFF",
        color:'white'
    },
    toggleText: {
        fontFamily: "DMSans_700Bold",
        color: "white",
    },
    untoggleText:{
        fontFamily: "DMSans_700Bold",
        color: "black", 
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