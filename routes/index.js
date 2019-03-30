var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('general/index', { layout: 'generallayouts'});
});

router.get('/admin/logout', function(req, res, next){
  res.render('general/index', { layout: 'admin'});
})

router.get('/order', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/index', {title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
  });
})

// /admin/dashbord/orders

router.get('/admin/orders', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  Order.find(function (err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('admin/orders', { layout: 'admin', title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
  });
})



router.get('/add-to-cart/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/order');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/order');
  });
});
router.get('/reduce/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});
router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', { products: null });
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});
router.get('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});

router.get('/checkoutbybkash', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkoutbkash', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});


router.post('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")(
    "sk_test_aNWyDyJSHrWndSPGxTSPF6nE"
  );
  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: "tok_mastercard", // obtained with Stripe.js
    description: "Test charge"
  }, function (err, charge) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save(function (err, result) {
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;
      res.redirect('/');
    });
  });
});

router.post('/addproduct', function (req, res) {
  console.log('comming here!!')
  var title = req.body.title;
  var imagePath = req.body.imagePath;
  var description = req.body.description;
  var price = req.body.price;
  console.log('values',req.body.title)
  console.log('values',req.body.imagePath)
  console.log('values',req.body.description)
  console.log('values',req.body.price)
  var newProduct = new Product({
    title: title,
    imagePath: imagePath,
    description: description,
    price: price
  })
  newProduct.save(function (err, res) {
  })

  res.redirect('/admin/dashbord');

})


router.post('/search', function (req, res) {
  var title = req.body.title;
  console.log('search')
  Product.find({ title: title }, function (err, product) {
    if (err) {
      res.send(err);
    }
    res.render('shop/search',{productd:product})
  })

})

// router.post('/search', function(req, res){
//   console.log('search')
//   var title = req.body.title;
//     console.log(name);
//     Product.find({title: title}, function(err, product){
//       if (err)
//       {
//           res.send(err);
//       }
//       console.log(product);
//       res.json(product);
//     })

// })

module.exports = router;
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
