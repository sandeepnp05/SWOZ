const User = require("../models/userModel");
const Products = require("../models/productModel");

// Render the wishlist page.verif

const loadWishlist = async (req, res) => {
  try {
    const { user_id } = req.session;
    const wishListData = await User.findById({ _id: user_id }).populate(
      "wishlist.productId"
    );
    const wishlist = wishListData.wishlist
    
    res.render("wishlist",{ user_id,wishlist: wishlist });
  } catch (err) {
    console.log(err.message);
  }
};
const addWishlist = async (req, res) => {
  try {
    const { user_id } = req.session;
    const { productId } = req.body;
    const date = new Date()
      .toLocaleDateString("en-us", {
        weekday: "short",
        day: "numeric",
        year: "numeric",
        month: "short",
      })
      .replace(",", "");
    const existingProduct = await User.findOne({
      _id: user_id,
      "wishlist.productId": productId,
    });
    if (!existingProduct) {
      const userWishlist = await User.findOneAndUpdate(
        { _id: user_id },
        { $push: { wishlist: { productId, date } } },
        { new: true }
      );
      const count = userWishlist.wishlist.length;
      console.log(count);
      res.status(200).json({ success: true, count });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
};
    const deleteWishlistProduct = async (req, res) => {
        const { wishlistId } = req.body;
        const { user_id } = req.session;

        const wishlistData = await User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { wishlist: { _id: wishlistId } } },
        {new:true}
        );
        res.status(200).json({ success: true, length: wishlistData.wishlist.length });
    };
  

module.exports = {
  loadWishlist,
  addWishlist,
  deleteWishlistProduct
};
