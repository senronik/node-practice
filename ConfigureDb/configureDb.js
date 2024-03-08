import mongoose from "mongoose";
export async function configDB(){
    const base_url = process.env.BASE_URL;
        try
         {
            await mongoose.connect(base_url)    
            console.log("DB Connected");
            
        }
         catch (error) 
         {
                 console.log(error);
        }
}