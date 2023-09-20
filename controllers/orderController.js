const User = require("../models/userModel");
const Products = require("../models/productModel");
const Razorpay = require("razorpay");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const couponHelper = require("../helpers/coupon_helper");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");


var instance = new Razorpay({
  key_id: process.env.YOUR_KEY_ID,
  key_secret: process.env.YOUR_KEY_SECRET,
});

const { addressForm } = require("./userController");

// Render the checkout page.

const 

loadCheckout = async (req, res) => {
  try {
    const { user_id } = req.session;
    const moment = require("moment");
    req.session.couponApplied = false;
    req.session.discountAmount = 0;
    const currentDate = new Date();
    const coupon = await Coupon.find({
      $and: [{ expiryDate: { $gte: new Date(currentDate) } }, { status: true }],
    });
    const cartCoupons=await User.findOneAndUpdate({_id:user_id},{ $unset: { coupon: 1 }})  

    const userOrder = await User.findOne({ _id: user_id }).populate(
      "cart.productId"
    );
    res.render("checkout", { userOrder, coupon, currentDate, moment });
  } catch (err) {
    console.error("Error in loadCheckout:", err);
    res.status(500).send("Internal Server Error");
  }
};

const orderAddress = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const {
      firstname,
      lastname,
      housename,
      city,
      district,
      state,
      mobile,
      pincode,
    } = req.body;
    const address = await User.updateOne(
      { _id: user_id },
      {
        $push: {
          address: {
            firstname: firstname,
            lastname: lastname,
            housename: housename,
            city: city,
            district: district,
            state: state,
            mobile: mobile,
            pincode: pincode,
          },
        },
      }
    );
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const { address, paymentMethod,finalAmount} = req.body;
    let grandTotal=req.body.grandTotal;
    const { user_id } = req.session;
    const moment = require("moment");
    req.session.couponApplied = false;
    req.session.discountAmount = 0;
if (isNaN(grandTotal) && !isNaN(finalAmount)) {
  grandTotal = parseFloat(finalAmount);
}
    
    const userData = await User.findOne({ _id: req.session.user_id });
    const products = userData.cart.map((cartItem) => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: cartItem.price,
    }));
    const status = paymentMethod === "COD" || paymentMethod === "WALLET" ? "Placed" : "Pending";
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    
     const min = 100000; // Smallest 6-digit number (100000)
     const max = 999999; // Largest 6-digit number (999999)
     const order_Id = Math.floor(Math.random() * (max - min + 1)) + min;

    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);
    const order = new Order({
      user: userData._id,
      products: products,
      total: grandTotal,
      shipAddress: address,
      status: status,
      method: paymentMethod,
      order_Id:order_Id,
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

    if (status == "Placed") {
      if (paymentMethod === "WALLET") {;
        await User.updateOne(
          { email: user_id },
          {
            $push: {
              walletHistory: {
                date: new Date(),
                amount: -grandTotal,
                description: "Order Payment using Wallet Amount",
              },
            },
            $inc: { wallet: -grandTotal },
          }
        );
        await Order.updateOne(
          { _id: orderId },
          { $set: { walletAmountUsed: grandTotal } }
        );
      }
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
    console.log(error.message);
  }
};
// apply coupon in checkout

const applyCoupon = async (req, res) => {
  try {
    const { couponCode, total } = req.body;

    const user = req.session.user_id;

    
    const coupon = await Coupon.findOne({ code: couponCode });

   
    if (coupon) {
      const now = new Date();

     
      if (coupon.expiryDate >= now) {
      
        const userExist=await User.findOne({_id: user,coupon:coupon._id})

       
        if (userExist) {
          res.json({
            success: false,
            message: "Coupon already used by the user",
          });
        } else {
       
          await User.findOneAndUpdate(
            { _id: user },
            {
              $set: {
                coupon: coupon._id,
              },
            }
          );
          const userCoupon = await User.findOne({ _id: user });
          let discounted;
          discounted = await couponHelper.discountPrice(userCoupon.coupon, total);
          if (couponHelper.coupon) {

          }
          res.json({
            success: true,
            message: "Available",
            discounted: discounted,
          });
        }
      }
    } else {
      res.json({ success: false, message: "Invalid Coupon" });
    }
  } catch (error) {
    console.log(error.message); 
  }
};

const orderConfirm = async (req, res) => {
  try {
    const { user_id } = req.session;
    const order = await Order.findOne({ user: user_id }).sort({
      createdAt: -1,
    });
    let cartCount = 0;
    if (user_id) {
      const userData = await User.findOne({ _id: user_id }).populate(
        "cart.productId"
      );
      cartCount = userData.cart.length;
    }
     

    res.render("orderSuccess", { order, cartCount });
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
    res.render("orderList2", { orderHistory });
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
    res.json({
      success: true,
      status: status1,
      message: "Order has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
const onlineVerifyPayment = async (req, res) => {
  try {
    const { user_id } = req.session;
    let userData = await User.findById({ _id: user_id });
    const details = req.body;
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.YOUR_KEY_SECRET);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
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
const loadInvoice = async (req,res) => {
  try {
    const {orderId} = req.query;
    const {user_id} = req.session;
    const userData = await User.findOne({_id:user_id})
    
    const orderData = await Order.findOne({_id:orderId}).populate('products.productId')
    const date = new Date()
    const data = {
      user:userData,
      order:orderData,
      date
    }


    const filepathName = path.resolve(__dirname, '../views/users/invoice.ejs');
    const html = fs.readFileSync(filepathName).toString();
    const ejsData = ejs.render(html, data);
    const browser = await puppeteer.launch({ headless: "new" }); 
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({ format: "Letter" }); 
    
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename= orderInvoice_swoz.pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  onlineVerifyPayment,
  loadCheckout,
  orderAddress,
  placeOrder,
  orderConfirm,
  orderedList,
  orderedProductDetails,
  cancelOrder,
  applyCoupon,
  loadInvoice
};
