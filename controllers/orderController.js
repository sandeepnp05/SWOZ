const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");

const { addressForm } = require("./userController");

 // Render the checkout page.

 const loadCheckout = async (req, res) => {
   try {
    const {user_id} = req.session;
    const userOrder = await User.findOne({_id:req.session.user_id}).populate("cart.productId")
     res.render("checkout",{userOrder}); 
   } catch (err) { 
     console.log(err.message); 
   }
 };  
 const orderAddress = async(req,res)=>{
    try {
        const user_id = req.session.user_id
        const {firstname,lastname,housename,city,district,state,mobile,pincode} = req.body;
        const address = await User.updateOne(
            {_id:user_id},{
                $push:{
                    address:{
                        firstname:firstname,
                        lastname:lastname,
                        housename:housename,
                        city: city,
                        district:district,
                        state:state,
                        mobile:mobile, 
                        pincode:pincode
                    }
                }
            } 
        );
        res.redirect('/checkout')
    } catch (error) {
      console.log(error.message);
    }
 }
 const placeOrder = async (req, res) => {
    try {
      const { address, paymentMethod, grandTotal } = req.body;
      const { user_id } = req.session;
      const userData = await User.findOne({ _id: req.session.user_id });
      const products = userData.cart.map((cartItem) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.price,
      }));
      const status =
        paymentMethod === "COD" 
          ? "Placed"
          : "Pending";
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);
      const order = new Order({
        user: userData._id,
        products: products,
        total: grandTotal,
        shipAddress: address,
        status: status,
        method: paymentMethod,
        date: new Date()
          .toLocaleDateString("en-us", {
            weekday: "short",
            day: "numeric",
            year: "numeric",
            month: "short",
          })
          .replace(",", ""),
        time: currentTime,
        expectedDelivery: expectedDeliveryDate.toDateString(),
      });
      await order.save();
      
      if (status == "Placed") {
        
        for (const cartItem of userData.cart) {
          await Products.updateOne(
            { _id: cartItem.productId },
            { $inc: { quantity: -cartItem.quantity } }
          );
        }
        await User.updateOne(
          { _id: user_id },
          { $set: { cart: [], grandTotal: 0 } }
        );
        res.json({ codSuccess: true });
      } 
    } catch (error) {
      res.render("500");
      console.log(error.message); 
    }
  };
  const orderConfirm = async (req, res) => { 
    try {
      const { user_id } = req.session;
      const order = await Order.findOne({ user:user_id }).sort({ createdAt: -1 });
      res.render("orderSuccess", { order }); 
    } catch (error) {
      res.render("500");
      console.log(error.message);
    }
  };
  const orderedList = async (req, res) => {
    try {
      const { user_id } = req.session;
      const orderHistory = await Order.find({ user: user_id })
     
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("products.productId");
      console.log(orderHistory);
      res.render("orderedList", { orderHistory }); 
    } catch (error) {
      console.log(error.message);
    }
  };
 module.exports = {
    loadCheckout,
    orderAddress,
    placeOrder,
    orderConfirm,
    orderedList
 }
