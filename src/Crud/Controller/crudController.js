import { StatusCodes } from "http-status-codes";
import { productsModel } from "../Model/crudModel.js";
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import csvParser from 'csv-parser';
import mongoose from "mongoose";
export async function addData(req, res) {
    try {
        const userId = req.headers.id;
        if (userId) {
            req.body['userId'] = userId;
            const data = new productsModel(req.body);
            const response = await data.save();
            res.status(StatusCodes.CREATED).json(response);
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).json("User Not Found")
        }
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
    }
}

export async function getProductData(req, res) {
    let { page, limit, sort, asc, type, name } = req.query;
    try {
        if (req.headers.role === 'user') {
            let filter = {};
            if (type) {
                filter.type = type;
            }
            if (name) {
                if (Array.isArray(name)) {
                    filter.name = { $in: name.map(value => new RegExp(value, 'i')) };
                }
                else {
                    filter.name = { $regex: new RegExp(name, 'i') };
                }
            }
            let allProducts;
            if (Object.keys(filter).length > 0) {
                allProducts = await productsModel.find(filter);
            } else {
                allProducts = await productsModel.find({ userId: req.headers.id });
            }

            page = parseInt(page) || 1;
            limit = parseInt(limit) || 5;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            let sortedProducts = [...allProducts];
            if (sort === 'name') {
                sortedProducts.sort((a, b) => {
                    return asc === 'true' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                });
            } else if (sort === 'price') {
                sortedProducts.sort((a, b) => {
                    return asc === 'true' ? a.price - b.price : b.price - a.price;
                });
            } else if (sort === 'created_date') {
                sortedProducts.sort((a, b) => {
                    const dateA = new Date(a.created_date);
                    const dateB = new Date(b.created_date);
                    return asc === 'true' ? dateA - dateB : dateB - dateA;
                });
            }
            const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
            res.status(StatusCodes.OK).json({
                totalPages: Math.ceil(allProducts.length / limit),
                currentPage: page,
                products: paginatedProducts
            });
        }
        else {

            res.status(StatusCodes.BAD_REQUEST).json("user not found")
        }
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
    }
}
//product getDataById with products all images
export async function getProductWithImgByid(req, res) {
    try {
        const Id = new mongoose.Types.ObjectId(req.params.id);
        const productWithImages = await productsModel.aggregate([
            {
                $match: { _id: Id }
            },
            {
                $lookup: {
                    from: 'productsimgmodels',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'images'
                }
            }
        ]);
        if (!productWithImages || productWithImages.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(productWithImages[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// //getProducts with images By userId'
// export async function getProductsWithImgByUserId(req, res) {
//     try {
//         const role = req.headers.role;
//         const userId = req.headers.id;
//         if (role === 'user') {
//             const productWithImages = await productsModel.aggregate([
//                 {
//                     $match: { userId: userId }
//                 },
//                 {
//                     $lookup: {
//                         from: 'productsimgmodels',
//                         localField: '_id',
//                         foreignField: 'productId',
//                         as: 'images'
//                     }
//                 }
//             ]);
//             if (!productWithImages || productWithImages.length === 0) {
//                 return res.status(404).json({ error: 'Product not found' });
//             }
//             res.status(200).json(productWithImages[0]);
//         }
//         else {
//             res.status(StatusCodes.BAD_REQUEST).json("user not found")
//         }
//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }
export async function updateProductData(req, res) {
    try {
        req.body['updatedDate'] = Date.now();
        const newData = req.body;
        const updtedData = await productsModel.findByIdAndUpdate(req.params.id, newData, { new: true });
        res.status(StatusCodes.OK).json(updtedData);
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
    }
}
export async function deleteProductByid(req, res) {
    try {
        await productsModel.findByIdAndDelete({ _id: req.params.id });
        res.status(StatusCodes.OK).json("Delete Product Item");
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
    }
}

export async function getProductsByUserId(req, res) {
    let { page, limit, sort, asc, type, name, csvfile, range, sdate, edate } = req.query;
    try {
        const Id = new mongoose.Types.ObjectId(req.headers.id);
        if (req.headers.role === 'user') {
            let filter = { userId: Id };
            if (type) {
                filter.type = { $regex: new RegExp(type, 'i') };
            }
            if (name) {
                if (Array.isArray(name)) {
                    filter.name = { $in: name.map(value => new RegExp(value, 'i')) };
                } else {
                    filter.name = { $regex: new RegExp(name, 'i') };
                }
            }
            if (range) {
                if (Array.isArray(range)) {
                    filter.price = { $in: price.map(range) }
                }
                else {
                    filter.price = range;
                }
            }
            const startDate = new Date(sdate);
            const endDate = new Date(edate);
            endDate.setHours(23, 59, 59, 999);
            if (sdate && edate) {
                filter.created_date = { $gte: startDate, $lte: endDate };
            }
            let allProducts;
            // if (Object.keys(filter).length > 0) {
            //     allProducts = await productsModel.find(filter);
            // } else {
            //     allProducts = await productsModel.find({ userId: req.headers.id });
            // }
            allProducts = await productsModel.aggregate([
                {
                    $match: filter
                },
                {
                    $lookup: {
                        from: 'productsimgmodels',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'images'
                    }
                }
            ]);
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            let sortedProducts = [...allProducts];
            sortedProducts.sort((a, b) => {
                if (sort === 'name') {
                    return asc === 'true' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                }
                else if (sort === 'price') {
                    return asc === 'true' ? a.price - b.price : b.price - a.price;
                }
                else if (sort === 'created_date') {
                    const dateA = new Date(a.created_date);
                    const dateB = new Date(b.created_date);
                    return asc === 'true' ? dateA - dateB : dateB - dateA;
                }
                return 0;
            });
            if (csvfile === "true") {
                if (sortedProducts.length === 0) {
                    return res.status(404).json({ success: false, message: 'No data found to export' });
                }
                const filterProducts = sortedProducts.map(product => {
                    const { _id, images, ...filteredProduct } = product;
                    return filteredProduct;
                })
                const headers = Object.keys(filterProducts[0]);
                const csvWriter = createObjectCsvWriter({
                    path: 'products.csv',
                    header: headers.map(header => ({ id: header, title: header }))
                });
                await csvWriter.writeRecords(sortedProducts);
                res.download('products.csv');
            }
            const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
            res.status(StatusCodes.OK).json({
                totalPages: Math.ceil(allProducts.length / limit),
                currentPage: page,
                products: paginatedProducts
            });
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).json("user not found")
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}
//pagination
export async function paginateProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 5;
        const skip = (page - 1) * perPage;
        const products = await productsModel.find().skip(skip).limit(perPage);
        const totalProductsCount = await productsModel.countDocuments();
        const totalPages = Math.ceil(totalProductsCount / perPage);
        res.status(StatusCodes.OK).json({
            products,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}
export async function importProductByCSV(req, res) {
    const csvFileBuffer = req.file;
    try {
        const userId = new mongoose.Types.ObjectId(req.headers.id);
        const csvString = csvFileBuffer.path;
        const results = [];
        fs.createReadStream(csvString)
            .pipe(csvParser())
            .on('data', (data) => results.push({ ...data, userId }))
            .on('end', async () => {
                await productsModel.insertMany(results);
                res.status(200).send('CSV data imported successfully');
            })
            .on('error', (error) => {
                console.error('Error parsing CSV file:', error);
                res.status(500).send('Error parsing CSV file: ' + error.message);
            });
    } catch (error) {
        console.error('Error importing CSV data:', error);
        res.status(500).send('Error importing CSV data: ' + error.message);
    }
}

export async function exportCSV(req, res) {
    try {
        const products = await productsModel.find({});
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'No data found to export' });
        }
        const csvWriter = createObjectCsvWriter({
            path: 'products.csv',
            header: [
                { id: 'name', title: 'name' },
                { id: 'price', title: 'price' },
                { id: 'description', title: 'description' },
                { id: 'type', title: 'type' },
                { id: 'created_date', title: 'created_date' },
                { id: 'updatedDate', title: 'updatedDate' },
            ]
        });

        await csvWriter.writeRecords(products.map(product => ({
            name: product.name,
            price: product.price,
            description: product.description,
            type: product.type,
            created_date: product.created_date ?? '',
            updatedDate: product.updatedDate ?? ''
        })));

        res.download('products.csv');
    } catch (error) {
        console.error('Error exporting CSV data:', error);
        res.status(500).send('Error exporting CSV data: ' + error.message);
    }
}
