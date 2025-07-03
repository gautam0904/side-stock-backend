import express from "express";
import { deleteProduct, updateProduct, getProduct } from "../controllers/product.controller.js";
import { createProduct} from "../controllers/product.controller.js";
import { authmiddle } from "../middleware/auth.middleware.js";


const productRoutes = express.Router();

productRoutes.post('/create', authmiddle, createProduct);
productRoutes.get('/get',authmiddle, getProduct);
productRoutes.put('/update/:id', authmiddle, updateProduct);
productRoutes.delete('/delete/:id', authmiddle, deleteProduct);

export default productRoutes;
    
