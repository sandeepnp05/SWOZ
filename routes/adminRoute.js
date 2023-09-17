const express = require("express");
const admin_route = express();
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const couponController = require("../controllers/couponController");
const offerController = require("../controllers/offerController");

const nocache = require("nocache");
const auth = require("../middleware/adminAuth");
const Products = require("../models/productModel");
const upload = require("../middleware/imageUpload");

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.use(nocache());

admin_route.get("/", auth.isLogout, adminController.adminLoad);
admin_route.get("/dashboard", auth.isLogin, adminController.dashboardLoad);
admin_route.post("/", adminController.adminVerifyLogin);
admin_route.get("/logout", adminController.logout);
admin_route.get("/userList", auth.isLogin, adminController.userList);
admin_route.get("/blockUser", adminController.blockUser);

admin_route.get("/categories", auth.isLogin, categoryController.categories);
admin_route.post("/categories", auth.isLogin, categoryController.addCategories);

admin_route.get(
  "/editCategory",
  auth.isLogin,
  categoryController.editCategories
);
admin_route.post(
  "/editCategory",
  auth.isLogin,
  categoryController.updatedCategory
);
admin_route.patch(
  "/listCategory",
  auth.isLogin,
  categoryController.listCategory
);

admin_route.get(
  "/productAddPage",
  auth.isLogin,
  productController.productAddPage
);
admin_route.get(
  "/productEditPage",
  auth.isLogin,
  productController.productEditPage
);
admin_route.get(
  "/productListPage",
  auth.isLogin,
  productController.productListPage
);

admin_route.post(
  "/productAddPage",
  auth.isLogin,
  upload.array("product_img", 4),
  productController.productAdd
);
admin_route.post(
  "/productEditPage",
  auth.isLogin,
  upload.array("product_img", 4),
  productController.productUpdated
);
admin_route.patch(
  "/productUnlist",
  auth.isLogin,
  productController.unlistProduct
);
admin_route.post(
  "/deleteImage",
  auth.isLogin,
  productController.deleteImage
);
admin_route.get('/orderList',auth.isLogin,adminController.orderList)
admin_route.get('/orderDetails',auth.isLogin,adminController.orderDetails)
admin_route.patch('/changeStatus',auth.isLogin,adminController.changeStatus)

admin_route.get('/coupon',auth.isLogin,couponController.loadCoupon)
admin_route.post('/coupon',auth.isLogin,couponController.addCoupon)
admin_route.patch('/listCoupon',auth.isLogin,couponController.listCoupon)
admin_route.post('/editCoupon',auth.isLogin,couponController.updatedCoupon)
admin_route.get('/editCoupon',auth.isLogin,couponController.editCoupon)

admin_route.get('/offer',auth.isLogin,offerController.loadOffer)
admin_route.post('/offer',auth.isLogin,offerController.addOffer)

admin_route.get('/salesReport',auth.isLogin,adminController.salesReport)

admin_route.post('/salesReport',auth.isLogin,adminController.sortSalesReport)


module.exports = admin_route;

