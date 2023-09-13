const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Coupon = require("../models/couponModel");
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const path = require("path");

dotenv.config();

const dashboardLoad = async (req, res) => {

  let usersData = [];
  let sales = [];

  // Calculate the starting date of the current year
  let currentSalesYear = new Date(new Date().getFullYear(), 0, 1);

  // Aggregate user registration data by month
  let usersByYear = await User.aggregate([
    { $match: { createdAt: { $gte: currentSalesYear }, is_blocked: { $ne: true } } },
    {
      $group: {
        _id: { $dateToString: { format: "%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();
  // Fill in missing months with zero counts
  for (let i = 1; i <= 12; i++) {
    let result = true;
    for (let j = 0; j < usersByYear.length; j++) {
      result = false;
      if (usersByYear[j]._id == i) {
        usersData.push(usersByYear[j]);
        break;
      } else {
        result = true;
      }
    }
    if (result) usersData.push({ _id: i, count: 0});
  }
  // Extract user counts for rendering
  let userData = usersData.map(user => user.count);

  // Aggregate sales data by month
  let salesByYear = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: currentSalesYear },
        orderStatus: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%m", date: "$createdAt" } },
        total: { $sum: "$grandTotal" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();;

  // Fill in missing months with zero sales
  for (let i = 1; i <= 12; i++) {
    let result = true;
    for (let j = 0; j < salesByYear.length; j++) {
      result = false;
      if (salesByYear[j]._id == i) {
        sales.push(salesByYear[j]);
        break;
      } else {
        result = true;
      }
    }
    if (result) sales.push({ _id: i, total: 0, count: 0 });
  }

  // Extract sales totals for rendering
  let salesData = sales.map(sale => sale.total);

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

  const monthly = monthlyEarning.length > 0 ? monthlyEarning[0].earning : 0;
  const totalRevenue = revenue.length > 0 ? revenue[0].revenue : 0;

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
      monthly,
      userData
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
      console.log(orderData);
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
  logout,
  userList,
  orderList,
  adminLoad,
  blockUser,
  orderDetails,
  changeStatus,
  dashboardLoad,
  adminVerifyLogin,
};
