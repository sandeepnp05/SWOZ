const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    console.log(err.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);

      if (passMatch) {
        if (userData.is_admin === 0) {
          res.render("login", { message: "Username or Password Incorrect" });
        } else {
          req.session.user_id = userData._id;

          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "Username or Password Incorrect" });
      }
    } else {
      res.render("login", { message: "Username or Password Incorrect" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

const loadDashboard = async (req, res) => {
  
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const admin = await User.findById({ _id: req.session.user_id });
    const regex = new RegExp(`^${search}`, "i");
    const usersData = await User.find({
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { mobile: { $regex: regex } },
      ],
    });
    res.render("dashboard", {
      admin: admin,
      users: usersData,
      searchValue: search,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (err) {
    console.log(err.message);
  }
};

const newUserLoad = async (req, res) => {
  try {
    res.render("new-user");
  } catch (err) {
    console.log(err.message);
  }
};

const addUser = async (req, res) => {
  const existMail = await User.findOne({ email: req.body.email });
  if (existMail) {
    res.render("new-user", { message: "Email already exists" });
  } else {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
      const password = randomstring.generate(10);

      const spassword = await securePassword(password);

      const user = new User({
        name: name,
        email: email,
        phone: phone,
        password: spassword,
      });

      const userData = await user.save();

      if (userData) {
        res.redirect("/admin/dashboard");
      } else {
        res.render("new-user", { message: "Something went wrong" });
      }
    } catch (err) {
      console.log(err.nessage);
    }
  }
};

const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          is_verified: req.body.verify,
        },
      }
    );

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(err.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(err.message);
  }
};

const logOut = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  newUserLoad,
  addUser,
  editUserLoad,
  updateUser,
  deleteUser,
  logOut,
};
