var express = require('express');
var router = express.Router();
var passport=require('passport');
var Product=require('../models/product');


router.get('/login', (req, res)=>{
    res.render('admin/login', {layout: 'admin-raw'})
  })
  
  router.get('/dashbord', (req, res)=>{
    res.render('admin/dashbord', {layout: 'admin'})
  })

  router.get('/addproduct', (req, res)=>{
    res.render('admin/productform', {layout: 'admin'})
  })

  router.get('/dashbord/products', function (req, res) {
        var products = Product.find(function (err, docs) {
            var conversionChunks = [];
            var chunkSize = 3;
            for (var i = 0; i < docs.length; i += chunkSize) {
                conversionChunks.push(docs.slice(i, i + chunkSize));
            }
            res.render('admin/dashbord/product/index', { layout: 'admin', products: conversionChunks });
        });
});

  router.post('/login',(req,res)=>{
    console.log('comming here1')
      var username = req.body.username;
      var password = req.body.password;
      if(username == 'admin'){
          if(password == "admin"){
        console.log('comming here2')
              res.redirect('/admin/dashbord');
          }else{
              res.redirect('/admin/login');
          }
      }
      else{
          res.redirect('/user/admin/login');
      }
  });
  module.exports = router;