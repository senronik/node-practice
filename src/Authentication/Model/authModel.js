import mongoose from "mongoose";
const registerModel = new mongoose.Schema({
        
           name:{
            type:String,
            required:true
         },
           number:{
            type:Number,
            required:true
         },
         email:{
            type:String,
            required:true
         },

         password:{
            type:String,
            required:true
         },
         country:{
            type:String,
            required:true
         },
         region:{
             type:String,
             required:true
         },
         address:{
            type:String,
            required:true
         },
         role:{
            type:String,
            required:true
         },

         file:{
               type:String
         },
         isActive:{
            type:String
         },
         otp:{
            type:String
         },
         created_date:{ 
            type: Date, 
            required: true,
             default: Date.now
             },
         updatedDate:{
            type:Date
         }

})
export const  registersModel = mongoose.model("registersModel",registerModel);