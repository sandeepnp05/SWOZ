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


module.exports = {
  dashboardLoad,
  adminLoad,
  adminVerifyLogin,
  logout,
  userList,
  blockUser,
};
