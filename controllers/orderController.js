const User = require("../models/userModel");
const Products = require("../models/productModel");
const Razorpay = require("razorpay");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
var instance = new Razorpay({ 
  key_id: process.env.YOUR_KEY_ID,
  key_secret: process.env.YOUR_KEY_SECRET,
});

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
      let totalAmount = order.total;
      let orderId = order._id;
      console.log(orderId);
      
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
      } else {
        var options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
          res.json({ order });
        });
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
      let cartCount = 0;
      if (user_id) {
        const userData = await User.findOne({ _id: user_id }).populate("cart.productId");
        cartCount = userData.cart.length;
      }
      res.render("orderSuccess", { order,cartCount }); 
      console.log('success',order);

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
      res.render("orderedList", { orderHistory }); 
    } catch (error) {
      console.log(error.message);
    }
  };
  const orderedProductDetails = async (req, res) => {
    try {
      const { id } = req.query;
      const order = await Order.findById({ _id: id }).populate(
        "products.productId"
        );
        
        console.log(order);

      
      res.render("orderedProducts", { order });
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };
  const cancelOrder = async (req, res) => {
    try {
      const { user_id } = req.session;
      const { orderId } = req.body;
      let status1 = "Cancelled";
      const order = await Order.findOne({ _id: orderId }).populate(
        "products.productId"
      );
      await Order.updateOne({ _id: orderId }, { $set: { status: status1 } });
      const products = order.products;
      for (let product of products) {
        await Products.updateOne(
          { _id: product.productId },
          { $inc: { quantity: product.quantity } }
        );
      }
      
      // Respond with a success message
      res.json({ success: true, status: status1, message: "Order has been cancelled successfully." });
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };
  const onlineVerifyPayment = async (req, res) => {
    try {
      console.log('onlineVerifyPayment called');
      const { user_id } = req.session;
      console.log('User ID:', user_id);
      let userData = await User.findById({ _id: user_id });
      console.log('User Data:', userData);
      const details = req.body;
      console.log('Request Body:', details);
      const crypto = require("crypto"); 
      let hmac = crypto.createHmac("sha256", process.env.YOUR_KEY_SECRET);
      hmac.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id
      );
      hmac = hmac.digest("hex");
      console.log('Calculated HMAC:', hmac);
      if (hmac === details.payment.razorpay_signature) {
        await Order.findByIdAndUpdate(
          { _id: details.order.receipt },
          { $set: { paymentId: details.payment.razorpay_payment_id } }
        );
        await Order.findByIdAndUpdate(
          { _id: details.order.receipt },
          { $set: { status: "Placed" } }
        );
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
        res.json({ success: true });
      } else {
        await Order.deleteOne({ _id: details.order.receipt });
        res.json({ success: false });
      }
    } catch (error) {
      console.log(error.message);
      res.json({ success: false });
    }
  };
  
 module.exports = {
    onlineVerifyPayment,
    loadCheckout,
    orderAddress,
    placeOrder,
    orderConfirm,
    orderedList,
    orderedProductDetails,
    cancelOrder
 }
