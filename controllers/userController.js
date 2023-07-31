const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");


const randomString = require("randomstring");

dotenv.config();
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("register", { message: "" });
  } catch (err) {
    console.log(err.message);
  }
};
//email otp
const sendEmail = async (firstname, email) => {
  try {
    otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email_user,
        pass: process.env.email_password,
      },
    });

    const options = {
      from: process.env.email_user,
      to: email,
      subject: "for email verification",
      html: `<p>Hi ${firstname} ,Please enter ${otp} for verification </p>`,
    };
    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(otp);
        console.log("email has been sent to:-", info.response);
      }
    });
    return otp;
  } catch (error) {
    console.log(error.message);
  }
};
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
//for reset password send mail
const sendResetPasswordEmail = async (firstname, email) => {
  try {
    const token = generateOTP();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email_user,
        pass: process.env.email_password,
      },
    });

    const options = {
      from: process.env.email_user,
      to: email,
      subject: "Reset Password",
      html: `<p>Hi ${firstname}, Please enter this token ${token} to reset your password</p>`,
    };

    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(token);
        console.log("Email has been sent to:-", info.response);
      }
    });

    // Update the user document in the database with the new token
    const updatedData = await User.findOneAndUpdate(
      { email: email },
      { $set: { token: token } },
      { new: true }
    );

    return { email: email, token: token };
  } catch (error) {
    console.log(error.message);
  }
};


//otp verification

const verifyOtp = async (req, res) => {
  try {
    const receivedOtp = req.body.otp;
    console.log(receivedOtp, "    " + req.session.otp);

    if (receivedOtp === req.session.otp) {
      const findUserAndUpdate = await User.findOneAndUpdate(
        { email: req.session.tempEmail },
        { $set: { is_verified: true } }
      );

      if (findUserAndUpdate) {
        req.session.user_id = findUserAndUpdate._id;
        res.redirect("/index");
      } else {
        res.render("otpLogin", {
          errMessage: "Failed to verify. Please try again later.",
        });
      }
    } else {
      res.render("otpLogin", {
        errMessage: "Invalid otp. Please check your otp.",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("otpLogin", {
      errMessage: "An error occurred. Please try again later.",
    });
  }
};


const insertUser = async (req, res) => {
  try {
    const { firstname, lastname, email, mobile, password, confirmPassword } =
      req.body;
    const existMail = await User.findOne({ email: email });

    if (existMail) {
      res.render("register", { message: "Email already registered" });
    } else {
      if (password !== confirmPassword) {
        res.render("register", { message: "Passwords do not match" });
        return;
      }

      console.log(lastname, firstname, email, mobile);
      const spassword = await securePassword(password);
      const user = new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone: mobile,
        password: spassword,
      });

      const userData = await user.save();
      if (userData) {
        const otp = await sendEmail(firstname, email);

        req.session.tempEmail = email;
        req.session.otp = otp;
        res.redirect("/otpLogin");
      } else {
        res.render("register", { message: "Your registration failed" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    res.render("login", {
      userSession: req.session.user_id ? req.session.user_id : "",
      firstname: "",
      message: "",
    });
  } catch (err) {
    console.log(err.message);
  }
};

//login
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);
      if (passMatch) {
        if (userData.is_verified === false) {
          res.render("login", { message: "Please verify your mail" });
        } else {
          req.session.user_id = userData._id;
          req.session.firstname = userData.firstname;
          res.redirect("/index");
        }
      } else {
        res.render("login", { message: "Email or Password Incorrect" });
      }
    } else {
      res.render("login", { message: "Email or Password Incorrect" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

// const loadHome = async (req, res) => {
//   try {
//     const userData = await User.findById(req.session.user_id);
//     const user = req.session.user_id
//     console.log(user);
//     res.render("index", { user: userData, userSession: user, firstname: userData.firstname });

//   } catch (err) {
//     console.log(err.message);
//   }
// };
const loadHome = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);
    const userSession = req.session.user_id ? req.session.user_id : "";
    res.render("index", {
      user: userData,
      userSession: userSession,
      firstname: userData.firstname,
    });
    
  } catch (err) {
    console.log(err.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (err) {
    console.log(err.message);
  }
};

const redirectUser = async (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    console.log(err.message);
  }
};
const loadIndex = async (req, res) => {
  try {
    res.render("index");
  } catch (err) {
    console.log(err.message);
  }
};
const loadContact = async (req, res) => {
  try {
    res.render("contact");
  } catch (err) {
    console.log(err.message);
  }
};
const loadCategory = async (req, res) => {
  try {
    res.render("category");
  } catch (err) {
    console.log(err.message);
  }
};
const loadOtp = async (req, res) => {
  try {
    res.render("otpLogin", { message: `Email has been sent to your mail` });
  } catch (err) {
    console.log(err.message);
  }
};

const loadProduct = async (req, res) => {
  try {
    res.render("single-product");
  } catch (err) {
    console.log(err.message);
  }
};

const loadCheckout = async (req, res) => {
  try {
    res.render("checkout");
  } catch (err) {
    console.log(err.message);
  }
};

const loadCart = async (req, res) => {
  try {
    res.render("cart");
  } catch (err) {
    console.log(err.message);
  }
};

const loadConfirmation = async (req, res) => {
  try {
    res.render("confirmation");
  } catch (err) {
    console.log(err.message);
  }
};
const loadWishlist = async (req, res) => {
  try {
    res.render("wishlist");
  } catch (err) {
    console.log(err.message);
  }
};
const loadForget = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === false) {
        res.render("forget", { message: "Please verify your mail." });
      } else {
        const token = randomString.generate(); 
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: token } } 
        );

        await sendResetPasswordEmail(userData.firstname, userData.email, token); 

        res.render("forget", {
          message: "Please check your mail to reset your password",
        });
      }
    } else {
      res.render("forget", { message: "User email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const resetLoad = async (req, res) => {
  try {
    res.render("resetPassword");
  } catch (err) {
    console.log(err.message);
  }
};
const userProfile = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id)
    console.log(userData);
    if (!userData) {
     
      return res.status(404).render('error', { message: 'User data not found' });
    }

    res.render("userProfile", { userData });
  } catch (err) {
    console.log(err.message);
    
    res.status(500).render('error', { message: 'Internal server error' });
  }
};


module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  logout,
  redirectUser,
  loadIndex,
  loadContact,
  loadCategory,
  loadOtp,
  loadProduct,
  sendEmail,
  loadCheckout,
  loadCart,
  loadConfirmation,
  verifyOtp,
  sendResetPasswordEmail,
  loadWishlist,
  loadForget,
  forgetVerify,
  resetLoad,
  userProfile,
};
