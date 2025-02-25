import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View,Text,TextInput,StyleSheet,TouchableOpacity } from "react-native";

export default function AddReview(){
    return (
        <View style={styles.container} >
            <View style={styles.rating}>
                <Text style={{fontFamily:'DMSans_700Bold'}}>Write a review</Text>
                <TextInput
                placeholder="Would you like to rate anything about this product?"
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
                // placeholderStyle={{}}
                style={{width:'100%',backgroundColor:'white'}}
                ></TextInput>
            </View>
            <View>
                <Text style={{fontFamily:'DMSans_700Bold'}}>Give a rating</Text>
                <View style={{flexDirection:'row',gap:10,alignItems:'center',justifyContent:'center'}}>
                    <TouchableOpacity>
                        <MaterialIcons name="star" size={50} color={'grey'}></MaterialIcons>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MaterialIcons name="star" size={50} color={'grey'}></MaterialIcons>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MaterialIcons name="star" size={50} color={'grey'}></MaterialIcons>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MaterialIcons name="star" size={50} color={'grey'}></MaterialIcons>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MaterialIcons name="star" size={50} color={'grey'}></MaterialIcons>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{alignItems:'center',marginTop:30}}>
                <TouchableOpacity style={styles.submitBtn}>
                    <Text style={{fontFamily:'DMSans_700Bold',color:'white'}}>Submit Review</Text>
                </TouchableOpacity>
            </View>
        </View>
    );;
}

const styles=StyleSheet.create({
    container:{
        
    },
    rating:{
        margin:10
    },
    stars:{

    },
    submitBtn:{
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