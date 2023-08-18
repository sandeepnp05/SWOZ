const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel")
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

// Render the register page.

const loadRegister = async (req, res) => {
  try {
    res.render("register", { message: "" });
  } catch (err) {
    console.log(err.message);
  }
};

// Send an email with an OTP for email verification.

const sendEmail = async (email) => {
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
      html: `
        <div style='font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2'>
          <div style='margin:50px auto;width:70%;padding:20px 0'>
            <div style='border-bottom:1px solid #eee'>
              <a href='' style='font-size:1.4em;color: #F6511D;text-decoration:none;font-weight:600'>SWOZ.ONLINE
            </div>
            <p style="font-size: 1.1em">Hi,</p>
            <p>Thank you for choosing SOWZ. Use the following OTP to complete your Sign Up procedures. OTP is valid for few minutes</p>
            <h2 style='background: #F6511D;margin: 0 auto;width: max-content;padding: 0 10px;color: white;border-radius: 4px;'>
              ${otp}
            </h2>
            <p style='font-size:0.9em;'>Regards,<br />SWOZ.ONLINE</p>
            <hr style='border:none;border-top:1px solid #eee' />
            <div style='float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300'>
              <p>swoz online Eco</p>
              <p>1600 Ocean Of Heaven</p>
              <p>Pacific</p>
            </div>
          </div>
        </div>
      `
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

// Verify the OTP entered by the user for email verification.

const verifyOtp = async (req, res) => {
  try {
    const receivedOtp = req.body.otp;

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
    });le.log
  }
};

// Insert a new user into the database after registration.

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
        const otp = await sendEmail(email);

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

// Render the login page.

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

// Verify user login credentials.

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
          req.session.user = email;
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

// Load the home page with products data.
 
const loadHome = async (req, res) => { 
  try {
    const {user_id} = req.session;
    const userSession = req.session.user_id ? req.session.user_id : "";
    const products = await Products.find({ list: true }).populate("category")

      res.render("index", {
        products,user_id
      });
    
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).send("Error fetching products"); 
  }
};

// Logout the user and destroy the session.

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (err) {
    console.log(err.message);
  }
};


// Redirect the user to the login page.

const redirectUser = async (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    console.log(err.message);
  }
};

// Render the contact page.

const loadContact = async (req, res) => {
  try {
    res.render("contact");
  } catch (err) {
    console.log(err.message);
  }
};

// Render the category page.

const loadCategory = async (req, res) => {
  try {
    res.render("category");
  } catch (err) {
    console.log(err.message);
  }
};

// Render the OTP verification page.

const loadOtp = async (req, res) => {
  try {
    res.render("otpLogin", { message: `Email has been sent to your mail` });
  } catch (err) {
    console.log(err.message);
  }
};

// Render the single product page.

const loadProduct = async (req, res) => {
  try {
    res.render("single-product");
  } catch (err) {
    console.log(err.message);
  }
};





// Render the order confirmation page.


const loadConfirmation = async (req, res) => {
  try {
    res.render("confirmation");
  } catch (err) {
    console.log(err.message);
  }
};

// Render the wishlist page.verif

const loadWishlist = async (req, res) => {
  try {
    res.render("wishlist");
  } catch (err) {
    console.log(err.message);
  }
};

// Render the forget password page.

const loadForget = async (req, res) => {
  try {
    res.render("forget");
  } catch (error) {
    console.log(error.message);
  }
};

// Render the OTP verification for forget password page

const loadVerifyForget = async (req,res)=>{
  try {

    res.render('otpForget')
  } catch (err) {
    console.log(err.message);
  }
}

// Verify the user's email for forget password.

const verifyForgetEmail = async(req,res)=>{
  try {
    const {email} = req.body;
   req.session.forEmail= req.body.email
   console.log(req.session.forEmail);
   
    const userData =  await User.findOne({email:email});
    if (userData){
      if(userData.is_verified){
        if(userData.is_blocked === false){
          const otp = await sendEmail(email)
            req.session.forOtp = otp;
            res.render("otpForget", {
              succMessage: "Enter otp to verify your email",
              formessage: "true",
              email,
            });
        }else{
          res.render('forget',{message:"User is blodked!."})
        }
      }else{
        res.render('forget',{message:'User email is not verified!..'})
      }
    }else{
      req.session.formessage = 'User not found'
      res.redirect('/forget')
    }
  } catch (error) {
    console.log(error.message);
  }
}
// Verify otp of forget mail
const verifyForgetOtp = async(req,res)=>{
  try {
    const recievedOtp = req.body.otp;
    let {forget} = req.body;
    const { email } = req.body;
    if (req.session.forOtp == recievedOtp) {
      res.redirect("/resetPassword?email=" + encodeURIComponent(email))
    } else {
      res.render("otpForget", {
        errMessage: "Invalid otp. Please check your otp",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render("otpForget", {
      errMessage: "An error occurred. Please try again later.",
    });le.log
  }
}
const resetPassword = async (req, res) => {
  try {
    const { email } = req.query;
    res.render('resetPassword', { email }); 
  } catch (error) {
    console.log(error.message);
  }
}

const newPassword = async(req,res)=>{
  try {
    const {password} = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { email: req.session.forEmail },
      { $set: { password: passwordHash } }
    );
    res.redirect("/forgetResetSuccess");
  } catch (error) {
    console.log(error.message);
  }
};
const loadForgetResetSuccess = async (req,res)=>{
  try {
    res.render('forgetResetSuccess')
  } catch (error) { 
    console.log(error.message);
  }
}

const loadSingleProduct = async(req,res)=>{
  try {
    const {id} = req.query;
    const user_id = req.session.user_id;
    const singleProduct = await Products.findById({_id:id}).populate("category");
    res.render('singleProduct',{singleProduct,user_id}) 
  } catch (error) {
    console.log(error.message);
  }
}

const userProfile = async (req, res) => { 
  try {
    const userData = await User.findById(req.session.user_id) 
    const email = req.session.user;
    const addAddressDetails = await User.findOne(
      { email: email },
      { address: 1 }
    );
    if (!userData) {
     
      return res.status(404).render('error', { message: 'User data not found' });
    }

    res.render("userProfile", { userData:userData,addAddressDetails:addAddressDetails });
  } catch (err) {
    console.log(err.message);
    
    res.status(500).render('error', { message: 'Internal server error' }); 
  }
};
const updateProfile = async(req,res)=>{
  try {
    const {firstname,lastname,phone} = req.body
    await User.updateOne({_id:req.session.user_id},
      {$set:{firstname:firstname,lastname:lastname,phone:phone}});
      res.redirect('/userProfile')
  } catch (error) {
    console.log(error.message);
  }
}

const addressForm = async(req,res)=>{
  try {
    const {userId,addressId} = req.query
  //  const userid= req.session.user_id
   
    const addAddressDetails = await User.findOne({_id:userId});
    
    res.render('addressForm',{addAddressDetails})
  } catch (error) {
    console.log(error.message);
  }
}
const updateAddress = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      firstname,
      lastname,
      housename,
      city,
      district,
      state,
      mobile,
      pincode,
    } = req.body;
    const updAddress = await User.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.firstname": firstname,
          "address.$.lastname": lastname,
          "address.$.housename": housename,
          "address.$.city": city,
          "address.$.district": district,
          "address.$.state": state,
          "address.$.mobile": mobile,
          "address.$.pincode": pincode,
        },
      }
    );
    
      res.redirect("/userprofile");
    
  } catch (error) {
    console.log(error.message);
  }
};
const addAddress = async(req,res) => {
  try {
    const email = req.session.user;
    const {firstname,lastname,city,district,state,mobile,pincode,housename} = req.body;
    await User.updateOne(
      {email:email},{
        $push:{address:{
          firstname:firstname,
          lastname: lastname,
          housename:housename, 
          city:city,
          district:district,
          state: state,
          mobile:mobile,
          pincode:pincode
        },
       },
      }
    );
    res.redirect('/userProfile')
  } catch (error) {
    console.log(error.message);
  }
}
const deleteAddress = async (req, res) => {
  try {
    const user = req.session.user_id;
    const { addressId } = req.body;
    const deleted = await User.updateOne(
      { _id: user },
      { $pull: { address: { _id: addressId } } }
    );
    res.json({ success: true }); // Send a response indicating successful deletion
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message }); // Send an error response if deletion fails
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
  loadContact, 
  loadCategory, 
  loadOtp,
  loadProduct,
  sendEmail, 
  loadConfirmation,
  verifyOtp,
  loadWishlist,
  loadForget,
  userProfile,
  loadVerifyForget,   
  resetPassword,
  newPassword,
  loadForgetResetSuccess,
  verifyForgetEmail,
  verifyForgetOtp,
  loadSingleProduct, 
  updateProfile,
  addAddress,
  addressForm,
  deleteAddress,
  updateAddress,

};
