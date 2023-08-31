const User = require("../models/userModel");
const cartCount = async (req, res, next) => {

  try {
    const { user_id } = req.session;
    let cartCount = 0;

    if (user_id) {
      const userData = await User.findOne({ _id: user_id }).populate("cart.productId");
      cartCount = userData.cart.length;
    }

    res.locals.cartCount = cartCount; // Set cartCount in res.locals
    next();
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports = {
  cartCount
};
