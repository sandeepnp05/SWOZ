const Category = require("../models/categoryModel");

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
    } catch (error) {error
      console.log(message);
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
  module.exports = {
    categories,
  addCategories,
  editCategories,
  updatedCategory,
  listCategory,
  }