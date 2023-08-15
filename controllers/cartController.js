const User = require("../models/userModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
 
// Render the cart page.

const loadCart = async (req, res) => {
    try {
        const userData = await User.findOne({email:req.session.user}).populate("cart.productId")
      res.render("cart");
    } catch (err) {
      console.log(err.message);
    }
  };
  const addToCart = async (req, res) => {
    try {
      const { user } = req.session;
      const { productId, quantity, singlePrice,totalStock} = req.body;
      const userCart = await User.findOne({email:user,"cart.productId": productId},{ "cart.$": 1 })
      const total = quantity * singlePrice;
      if (userCart) {
        const cartQuantity = userCart.cart[0].quantity
        if(cartQuantity<totalStock){
          const existingProduct = await User.findOneAndUpdate(
            { email: user, "cart.productId": productId },
            {
              $inc: {
                "cart.$.quantity": parseInt(quantity),
                "cart.$.total": total,
                grandTotal: total,
              },
            }
          );
            res.status(200).json({ message: "Product added to cart" });
        }else{
          res.status(200).json({ cartMessage: "Out of stock" });
        }
  
        
        } else {
          let cartUpdate=await User.findOneAndUpdate(
            { email: user },
            {
              $push: { cart: { productId, quantity, total } },
              $inc: { grandTotal: total },
            },{new:true}
          );
          const count = cartUpdate.cart.length
          res.status(200).json({ message: "Product added to cart",count });
        }
    } catch (error) {
      console.log(error.message);
    }
  };
    
module.exports={
loadCart,
addToCart
};