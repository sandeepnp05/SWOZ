const Products = require("../models/productModel");
const Category = require("../models/categoryModel");


const productAddPage = async (req, res) => {
    try {
      const categories = await Category.find();
      res.render("productAddPage", { categories });
    } catch (error) {
      console.log(error.message);
    }
  };
  const productEditPage = async (req, res) => {
    try {
      const {id} = req.query
      const categories = await Category.find();
      const product = await Products.findById({_id:id});
      res.render("productEditPage",{categories,product});
    } catch (error) {
      console.log(error.message);
    }
  };
  const productListPage = async (req, res) => {
    try {
      const product = await Products.find().populate("category");
      res.render("productListPage", { product });
    } catch (error) {
      console.log(error.message);
    }
  };
  const productAdd = async (req, res) => {
    try { 
      const {
        product_name,
        product_description,
        product_price,
        product_quantity,
        product_category,
        product_brand,
      } = req.body;
      const imageArr = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const filePath = path.join(
            __dirname,
            "../public/images",
            req.files[i].filename
          );
          console.log("FilePath:", filePath);
          // await sharp(req.files[i].path)
          //     .resize({ width: 250, height: 250 })
          //     .toFile(filePath);
          imageArr.push(req.files[i].filename);
        }
      }
      const product = new Products({
        name: product_name,
        description: product_description,
        price: product_price,
        quantity: product_quantity,
        category: product_category,
        image: imageArr,
        brand: product_brand,
        stock: true,
      });
      await product.save();
      res.redirect("/admin/productListPage");
    } catch (error) {
      console.log(error.message);
    }
  };
  const productUpdated = async (req, res) => {
    try {
    
      const {
        product_id,
        product_name,
        product_description,
        product_price,
        product_quantity,
        product_category,
        product_brand,
      } = req.body;
      const imageArr = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const filePath = path.join(
            __dirname,
            "../public/uncroppedImages",
            req.files[i].filename
          );
          imageArr.push(req.files[i].filename);
        }
        }
        if (req.files.length) {
          const updated = await Products.updateOne(
            { _id: product_id },
            
            {
              $set: {
                name: product_name,
                price: product_price,
                quantity: product_quantity,
                category: product_category,
                description: product_description,
                brand: product_brand,
                image: imageArr,
              },
            }
          );
          res.redirect("/admin/productListPage");
        } else {
         const updated = await Products.updateOne(
            { _id: product_id },
            {
              $set: {
                name: product_name,
                quantity: product_quantity,
                price: product_price,
                description: product_description,
                category: product_category,
              },
            }
          );
  
          res.redirect("/admin/productListPage");
        }
      
    } catch (error) {
      console.log(error.message);
     
      res.status(500).send("An error occurred.");
    }
  };
  const unlistProduct = async(req,res)=>{
    try {
      const {productId} =req.body
      const product = await Products.findById({_id:productId})
      if(product.list === true){
        await Products.updateOne({_id:productId},{$set:{list:false}})
        res.status(201).json({listSucces:true});
      }else{
        await Products.updateOne({_id:productId},{$set:{list:true}})
        res.status(201).json({listSucces:false});
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  module.exports ={
    productAddPage,
  productEditPage,
  productListPage,
  productAdd,
  productUpdated,
  unlistProduct,
  }