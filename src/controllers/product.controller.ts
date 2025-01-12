import { Request, Response } from "express";
import { ProductService } from "../services/product.service.js";
import { IProduct } from "../interfaces/product.interface.js"; 
import { statuscode } from "../constants/status.js";
import { ERROR_MSG } from "../constants/message.js";

const productService = new ProductService();

export const createProduct = async (req: Request, res: Response) => {
    try {
        const productData: IProduct = req.body;
        const createdProduct = await productService.createProduct(productData);
        res.status(createdProduct.statuscode).json(createdProduct);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const getProduct = async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const products = await productService.getProduct(query);
        res.status(products.statuscode).json(products);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const productData: IProduct = req.body;
        const updatedProduct = await productService.updateProducts(productData);
        res.status(updatedProduct.statuscode).json(updatedProduct);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await productService.deleteProduct(productId);
        res.status(deletedProduct.statuscode).json(deletedProduct);
    } catch (error) {
        res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
    }
}


