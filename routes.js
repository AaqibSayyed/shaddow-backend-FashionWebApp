const router = require('express').Router()
const productController = require('./controller/product.controller.js')
const userController  = require('./controller/user.controller.js')
const orderController  = require('./controller/order.controller.js')

const {isAuthenticated,isAuthorizeRole} = require('./middleware/auth.js')

//product routes
router.post('/admin/product/new',isAuthenticated, isAuthorizeRole('admin'), productController.createProduct)
router.get('/products',productController.getAllProducts)
router.get('/product/:id',productController.getProduct)
router.put('/admin/product/:id',isAuthenticated,isAuthorizeRole('admin'),productController.updateProduct)
router.delete('/admin/product/:id',isAuthenticated,isAuthorizeRole('admin'),productController.deleteProduct)
router.put('/product/reviews',isAuthenticated,productController.createOrUpdateReview)
router.get('/review',productController.getProductReviews)
router.delete('/product/reviews',isAuthenticated,productController.deleteReview)

//User Routes
router.post('/register',userController.userRegister)
router.post('/login',userController.userLogin)
router.get('/logout',isAuthenticated,userController.userLogout)
router.post('/forgetPassword',userController.forgetPassword)
router.put('/password/reset/:token',userController.passwordReset)
router.get('/me',isAuthenticated,userController.getUserDetails)
router.put('/password/update',isAuthenticated, userController.updatePassword)
router.put('/update/me',isAuthenticated, userController.updateUserProfile)
router.get('/admin/users',isAuthenticated, isAuthorizeRole('admin'), userController.getAllUsers)
router.get('/admin/user/:id',isAuthenticated, isAuthorizeRole('admin'), userController.getSingleUser)
router.put('/admin/user/:id',isAuthenticated, isAuthorizeRole('admin'), userController.updateUserRole)
router.delete('/admin/user/:id',isAuthenticated, isAuthorizeRole('admin'), userController.deletUser)

//Order Routes
router.post('/order', isAuthenticated, orderController.createOrder)
router.get('/admin/order/:id',isAuthenticated,isAuthorizeRole('admin'),orderController.getSingleOrder)
router.get('/order/me', isAuthenticated, orderController.getUserOrders)
router.get('/admin/order', isAuthenticated,isAuthorizeRole('admin'), orderController.getAllOrders)
router.delete('/admin/order/:id', isAuthenticated,isAuthorizeRole('admin'), orderController.deleteOrder)
router.put('/admin/order/:id', isAuthenticated,isAuthorizeRole('admin'), orderController.updateOrder)

module.exports = router