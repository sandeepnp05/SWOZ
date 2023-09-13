const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: true,
    },
    address: [
      {
        firstname: {
          type: String,
        },
        lastname: {
          type: String,
        },
        housename: {
          type: String,
        },
        city: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        mobile: {
          type: Number,
        },
        pincode: {
          type: Number,
        },
      },
    ],
    cart: [
      {
        productId: {
          type: ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        total: {
          type: Number,
          default: 0,
        },
      },
    ],

    wishlist: [
      {
        productId: {
          type: ObjectId,
          ref: "Products",
          required: true,
        },
        date: {
          type: Date,
        },
      },
    ],
    grandTotal: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      requried: false,
    },
    wallet: {
      type: Number,
      default:0
    },
    walletHistory: [
      {
        date: {
          type: Date,
        },
        amount: {
          type: Number,
        },
        description: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
