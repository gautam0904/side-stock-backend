import express from "express";
import { deleteProduct, updateProduct, getProduct } from "../controllers/product.controller.js";
import { createProduct} from "../controllers/product.controller.js";


const productRoutes = express.Router();

productRoutes.post('/create', createProduct);
productRoutes.get('/get', getProduct);
productRoutes.put('/update/:id', updateProduct);
productRoutes.delete('/delete/:id', deleteProduct);

export default productRoutes;
    
