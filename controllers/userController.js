const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer")
require("dotenv").config();

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
    res.render("register");
  } catch (err) {
    console.log(err.message);
  }
};
//email otp
const sendEmail = async (name, email, user_id) => {
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
      html: `<p>Hii ${name} ,Please enter ${otp} for verification </p>`,
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

//Register
const insertUser = async (req, res) => {
  try {
    const existMail = await User.findOne({ email: req.body.email });
    if (existMail) {
      res.render("register", { message: "Email already registered" });
    } else {
      const { firstname, lastname, email, mobile, password, confirmPassword } = req.body;

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
      console.log(userData);

      if (userData) {
        sendEmail(req.body.name,req.body.mail,userData._id)
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
    res.render("login");
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
        if (userData.is_verified === 0) {
          res.render("login", { message: "Please verify your mail" });
        } else {
          req.session.user_id = userData._id;
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

const loadHome = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);
    const user = req.session.user_id
    console.log(user);
    res.render("index", { user: userData,userSession:user});

  } catch (err) {
    console.log(err.message);
  }
};


const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/index");
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
    res.render("otpLogin");
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

const loadCart = async(req, res)=> {
  try {
    res.render('cart')
  } catch (err) {
    console.log(err.message);
  }
}

const loadConfirmation = async(req, res)=>{
  try {
    res.render('confirmation')
  } catch (err) {
    console.log(err.message);
  }
}


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
  loadConfirmation
 
};
