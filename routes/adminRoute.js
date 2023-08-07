const express = require("express");
const admin_route = express();
const adminController = require("../controllers/adminController");
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

admin_route.get("/categories", auth.isLogin, adminController.categories);
admin_route.post("/categories", auth.isLogin, adminController.addCategories);
admin_route.get("/editCategory", auth.isLogin, adminController.editCategories);
admin_route.post(
  "/editCategory",
  auth.isLogin,
  adminController.updatedCategory
);
admin_route.patch("/listCategory", auth.isLogin, adminController.listCategory);

admin_route.get(
  "/productAddPage",
  auth.isLogin,
  adminController.productAddPage
);
admin_route.get(
  "/productEditPage",
  auth.isLogin,
  adminController.productEditPage
);
admin_route.get(
  "/productListPage", 
  auth.isLogin,
  adminController.productListPage
);

admin_route.post(
  "/productAddPage",
  auth.isLogin,
  upload.array("product_img", 4),
  adminController.productAdd
);
admin_route.post(
    "/productEditPage",
    auth.isLogin,
    upload.array("product_img", 4),
    adminController.productUpdated, 
  );
  admin_route.patch("/productUnlist",
   auth.isLogin, adminController.unlistProduct);
module.exports = admin_route;
  