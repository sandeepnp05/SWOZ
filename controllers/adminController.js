const dotenv = require("dotenv");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
dotenv.config()

const dashboardLoad = async(req,res)=>{
  try {
    res.render('dashboard')
  } catch (error) {
    console.log(error);
  }
};

const adminLoad = async(req,res)=>{
  try {
    res.render('adminLogin')
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
const logout = async(req,res)=>{
  try {
    req.session.destroy()
    res.render('adminLogin')
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
    
    res.render('userList', { users: usersData, search });
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
const categories = async(req,res)=>{
  try {
    const { message } = req.session; 
    req.session.message = ""; 
    const categoryDetails = await Category.find();
    res.render('categories',{message,category:categoryDetails})
  } catch (error) {
    console.log(error.message);
  }
}
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
          req.session.message = 'Category added successfully';
      } else {
          req.session.message = 'This category is already defined';
      }

      res.redirect('/admin/categories');
  } catch (error) {
      console.log(error.message);
      req.session.message = 'An error occurred while adding the category';
      res.redirect('/admin/categories');
  }
};
const editCategories = async (req, res)=>{
  try {
    res.render('editCategory')
  } catch (error) {
    console.log(error.message);
  }
};






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
};
