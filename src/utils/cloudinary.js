//let server get file then we have to put int claudainry
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDIANRY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath)return null;
        const response=await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })
        //console.log('Uploaded to claudinary',response.url);  for testing pupose
        fs.unlinkSync(localFilePath);//remove the locally save temporary file as the the uplaod iperation  get success

        return response;
    }
    catch(error){
       fs.unlinkSync(localFilePath);//remove the locally save temporary file as the the uplaod iperation  get failed
        return null;
    }   
}

export {uploadOnCloudinary};



// const uploadOnClaudinary = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        }
//     );


