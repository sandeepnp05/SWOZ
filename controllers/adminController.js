const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");

dotenv.config();

const dashboardLoad = async (req, res) => {
  const totalOrder = await Order.countDocuments({
    status: { $nin: ["Pending", "Returned", "Placed"] },
  });
  const pendingCount = await Order.countDocuments({ status: "Pending" });
  const placedCount = await Order.countDocuments({ status: "Placed" });
  const deliveredCount = await Order.countDocuments({ status: "Delivered" });
  const cancelledCount = await Order.countDocuments({
    status: "Cancelled",
  });

  const countProduct = await Product.countDocuments();
  const countCategory = await Category.countDocuments();

  const orderData = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user")
    .populate("products.productId")
    .exec();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const monthlyEarning = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
        $expr: { $eq: [{ $month: "$createdAt" }, currentMonth] },
      },
    },
    { $group: { _id: null, earning: { $sum: "$total" } } },
  ]);

  const revenue = await Order.aggregate([
    { $match: { status: { $ne: ["Pending", "Returned"] } } },
    { $group: { _id: null, revenue: { $sum: "$total" } } },
  ]);
  const monthly = monthlyEarning[0].earning
  console.log(monthly);
  const totalRevenue = revenue[0].revenue;

  try {
    res.render("dashboard", {
      orderData,
      placedCount,
      deliveredCount,
      cancelledCount,
      pendingCount,
      totalRevenue,
      totalOrder,
      countProduct,
      countCategory,
      monthly
    });
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
  } catch (error) {}
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
const orderList = async (req, res) => {
  try {
    const orderData = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("products.productId")
      .exec();
    res.render("orderList", { orderData });
  } catch (error) {
    console.log(error.message);
  }
};
const orderDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const orderData = await Order.findById({ _id: id })
      .populate("user.user")
      .populate("products.productId");
    res.render("orderDetails", { orderData });
  } catch (error) {
    console.log(error.message);
  }
};
const changeStatus = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;
    await Order.updateOne({ _id: orderId }, { $set: { status: status } });
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboardLoad,
  adminLoad,
  adminVerifyLogin,
  logout,
  userList,
  blockUser,
  orderList,
  orderDetails,
  changeStatus,
};
