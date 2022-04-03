const propertyModel = require('../models/Property');
const categoryModel = require('../models/Category');
const { mongooseToObject } = require('../util/mongoose');
const mongoose = require('mongoose');
const slugify = require('slugify');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// --------CLOUDINARY SETUP---------
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports.loadProperties = (propertiesPerPage, currentPage) => {
    return new Promise((resolve, reject) => {
        // load properties corresponding to current page
        // load from (propertiesPerPage * currentPage) - propertiesPerPage
        // ex: propertiesPerPage = 8, currentPage = 1 => 8 * 1 - 8 = 0 => the 1st page will not skip any element
        // ex: propertiesPerPage = 8, currentPage = 2 => 8 * 2 - 8 = 8 => the 2nd page will skip 8 elements
        propertyModel
            .find()
            .sort({'updatedAt':-1})
            .skip((propertiesPerPage * currentPage) - propertiesPerPage)
            .limit(propertiesPerPage)
            .exec((err, properties) => {
                if(err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    propertyModel.countDocuments((err, count) => {
                        if(err) {
                            console.log(err);
                            reject(err);
                        }
                        else {
                            resolve({
                                properties: properties,
                                count: count
                            });
                        }
                    });
                }
            });
    })
}

module.exports.loadProperty = (propertyId) => {
    return new Promise((resolve, reject) => {
        propertyModel.findById(propertyId, function (err, property) {
            if(err) {
                console.log(err);
                reject(err);
            }
            resolve(property);
        });
    });
}

async function generateUniqueSlug(model, field) {
    return new Promise((resolve, reject) => {
        const slug = uniqid((slugify(model[field], {lower:true, locale: 'vi'}) + '-'));
        model.slug = slug;
        resolve(slug);
    });
}


async function addNewPropertyToCategoryCollection(categoryId,propertyId){
    return new Promise(async (resolve, reject) => {
        categoryModel.findOne({_id:categoryId})
        .then((category)=>{
            let newProperties = mongooseToObject(category).properties
            newProperties.push(mongoose.Types.ObjectId(propertyId));
            categoryModel.updateOne({_id:categoryId},{properties:newProperties})
            .then(()=>{
                resolve('success')
            })
            .catch((error) => {
                reject(error);
            })
        })
        .catch((error) => {
            reject(error);
        })
        
    })
}

async function getCategoryIdByName(categoryName) {
    return new Promise(async (resolve, reject) => {
        categoryModel.findOne({ name: categoryName }, (err, category) => {
            if(err) {
                console.log(err);
                reject(err);
            }
            resolve(mongooseToObject(category)._id.toString());
        });
    });
}

async function generateUploadPath(base, listOfImage, slug, type) {
    // ---------PARAMETER---------
    // base: base path to img
    // type: 'preview' or 'detail' (for dividing img into folders according to type)
    return new Promise((resolve, reject) => {
        // Array contains paths to store uploaded images
        var pathList = [];
        for(let i = 0; i < listOfImage.length; i++) {
            pathList.push(base + slug + '-' + type + '-' + i.toString());
            if(i == listOfImage.length - 1)
                resolve(pathList);
        }
    });
}

async function uploadImageToCloud(listOfPath, listOfImage) {
    return new Promise((resolve, reject) => {
        var resultUrl = [];
        listOfImage.forEach((img, index) => {
            const cld_upload_stream = cloudinary.uploader.upload_stream(
                {public_id: listOfPath[index]}, // slug based ID (for SEO)
                function(err, result) {
                    if(err) {
                        console.log('Upload error: ' + err);
                        reject(err);
                    }
                    resultUrl.push(result.secure_url);
                    if(index == listOfImage.length - 1) {
                        resolve(resultUrl);
                    }
                }
            );
            // Push img.buffer in to upload stream
            streamifier.createReadStream(img.buffer).pipe(cld_upload_stream);
        });
    });
}