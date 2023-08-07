const Category = require("../models/categoryModel");
const Products = require("../models/productModel");
const User = require("../models/userModel");

const randomstring = require("randomstring");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");

dotenv.config();

const dashboardLoad = async (req, res) => {
  try {
    res.render("dashboard");
  } catch (error) {
    console.log(error);
  }
};

const adminLoad = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error);
  }
};
const adminVerifyLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (process.env.admin_email === email) {
      if (process.env.admin_password === password) {
        req.session.admin = email;
        res.redirect("/admin/dashboard");
      } else {
        res.render("adminLogin", { errMessage: "Password is incorrect" });
      }
    } else {
      res.render("adminLogin", { errMessage: "Email is incorrect" });
    }
  } catch (error) {
    console.log(error);
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.render("adminLogin");
  } catch (error) {
    console.log();
  }
};
const userList = async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");

    const usersData = await User.find({
      $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }],
    });

    res.render("userList", { users: usersData, search });
  } catch (error) {
    console.log("Error in userList:", error);
    res.status(500).send("An error occurred.");
  }
};
const blockUser = async (req, res) => {
  try {
    const { id } = req.query; // Access the id parameter from req.query
    const user = await User.findById(id); // Pass id directly to User.findById
    if (!user) {
      // Handle the case when the user is not found
      return res.status(404).send("User not found");
    }

    // Toggle the is_blocked value
    user.is_blocked = !user.is_blocked;
    await user.save();

    res.redirect("/admin/userList");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred.");
  }
};
const categories = async (req, res) => {
  try {
    const { message } = req.session;
    req.session.message = "";
    const categoryDetails = await Category.find();
    res.render("categories", { message, category: categoryDetails });
  } catch (error) {
    console.log(error.message);
  }
};
const addCategories = async (req, res) => {
  try {
    const { category_name, category_description } = req.body;
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category_name}$`, "i") },
    });

    if (!existingCategory) {
      const newCategory = new Category({
        name: category_name,
        description: category_description,
      });
      await newCategory.save();
      req.session.message = "Category added successfully";
    } else {
      req.session.message = "This category is already defined";
    }

    res.redirect("/admin/categories");
  } catch (error) {
    console.log(error.message);
    req.session.message = "An error occurred while adding the category";
    res.redirect("/admin/categories");
  }
};
const editCategories = async (req, res) => {
  try {
    const { id } = req.query;
    const category = await Category.findById({ _id: id });
    res.render("editCategory", { category });
  } catch (error) {
    console.log(error.message);
  }
};
const updatedCategory = async (req, res) => {
  try {
    const { id, category_name, category_description } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { name: category_name, description: category_description } }
    );
    await updatedCategory.save();
    res.redirect("/admin/categories");
  } catch (error) {
    consol.log(error);
  }
};
const listCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log(categoryId);
    const category = await Category.findById({ _id: categoryId });
    if (category.status === true) {
      await Category.updateOne(
        { _id: categoryId },
        { $set: { status: false } }
      );
      res.status(201).json({ message: true });
    } else {
      await Category.updateOne({ _id: categoryId }, { $set: { status: true } });
      res.status(201).json({ message: false });
    }
  } catch (error) {
    res.redirect("/error500");
  } 
};
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
    console.log(product);
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
        console.log(req.files);
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
    console.log(product);
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
    console.log(product_id);
    console.log('hai');
    const imageArr = [];
    console.log(req.files );
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
        console.log(updated,'1');
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
        console.log(updated,'2');

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


module.exports = {
  dashboardLoad,
  adminLoad,
  adminVerifyLogin,
  logout,
  userList,
  blockUser,
  categories,
  addCategories,
  editCategories,
  updatedCategory,
  listCategory,
  productAddPage,
  productEditPage,
  productListPage,
  productAdd,
  productUpdated,
  unlistProduct,
};
