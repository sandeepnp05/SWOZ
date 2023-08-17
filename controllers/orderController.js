const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const order = require("../models/orderModel");

const { addressForm } = require("./userController");

 // Render the checkout page.

 const loadCheckout = async (req, res) => {
   try {
    const {user_id} = req.session;
    const userOrder = await User.findOne({_id:user_id}).populate("cart.productId")
     res.render("checkout",{userOrder});
   } catch (err) { 
     console.log(err.message);
   }
 }; 
 const orderAddress = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const {firstname,housename,city,district,state,mobile,pincode} = req.body;
        const address = await User.updateOne(
            {_id:user_id},{
                $push:{
                    address:{
                        firstname:firstname,
                        ciyt: city,
                        district:district,
                        state:state,
                        mobile:mobile,
                        pincode:pincode
                    }
                }
            }
        )
    } catch (error) {
      console.log(error.message);
    }
 }
 module.exports = {
    loadCheckout,
 }
