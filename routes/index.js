var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs")
const passport = require("passport");
const Post = require('../models/post');
const User = require("../models/user")
const authMiddleware = require("./authmiddleware")
/* GET home page. */
const { body,validationResult } = require("express-validator");

router.get('/', authMiddleware.alreadyLoggedIn, function(req, res, next) {
  res.redirect("/register")
});

router.get("/log-out", authMiddleware.isAuth, (req, res) => {
  req.logout();
  res.redirect("/register");
});

router.get("/register", authMiddleware.alreadyLoggedIn, function(req,res,next) {
  res.render("register_form", {title: "Members Only", user: req.user})
})

router.get("/profile", authMiddleware.isAuth, (req,res,next) => {
  res.render("profile", {user: req.user})
})

router.post("/register", authMiddleware.alreadyLoggedIn, [
  body('first_name', 'First Name required').trim().isLength({ min: 1 }).escape(),
  body('second_name', 'Second Name required').trim().isLength({ min: 1 }).escape(),
  body('username', 'Username required').trim().isLength({ min: 1 }).escape(),
  // body("email","Email Addres must be valid").normalizeEmail().isEmail(),
  body('password', 'Password required').trim().isLength({ min: 4 }).escape(),
  body('confirm_password', "Passwords must match").exists().custom((value, { req }) => value === req.body.password),

  (req, res, next) => {

  const errors = validationResult(req);

  
  if (!errors.isEmpty()) {
    // There are errors. Render the form again with sanitized values/error messages.
    res.render('register_form', { title: 'Register', errors: errors.array()});
    return;
  }
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    // if err, do something
    // otherwise, store hashedPassword in DB
    const user = new User({
      username: req.body.username,
      first_name: req.body.first_name,
      second_name: req.body.second_name,
      password: hashedPassword,
      isAdmin: false,
      isMember: false
  }).save(err => {
    if (err) { 
      return next(err);
    };
    res.redirect("/login");
  });
  });
}]);

router.get("/login", authMiddleware.alreadyLoggedIn, function(req, res, next) {
  res.render("login_form")
})

router.post("/login", authMiddleware.alreadyLoggedIn,
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login"
  })
);

router.get("/join", authMiddleware.isAuth, (req, res, next) => {
  res.render("member_form")
})

router.post("/join", authMiddleware.isAuth, [
  body('code', 'Code is required').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('member_form', { errors: errors.array()});
      return;
    }

    if (req.body.code === process.env.MEMBER_PASS) {
      User.findByIdAndUpdate(req.user._id, { isMember: true}, function updateUser(err) {
        if (err) {return next(err)}
        res.redirect("/profile")
    })
    }
    else {
      res.render("member_form")
    }
  }
])

router.get("/become-admin", authMiddleware.isAuth, (req, res, next) => {
  res.render("admin_form")
})

router.post("/become-admin", authMiddleware.isAuth, [
  body('code', 'Code is required').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('admin_form', { errors: errors.array()});
      return;
    }

    if (req.body.code === process.env.ADMIN_PASS) {
      User.findByIdAndUpdate(req.user._id, { isAdmin: true}, function updateUser(err) {
        if (err) {return next(err)}
        res.redirect("/profile")
    })
    }
    else {
      res.render("admin_form")
    }
  }
])

router.get("/create_post", authMiddleware.isAuth, (req,res,next) => {
  res.render("post_form", {user: req.user})
})

router.post("/create_post", authMiddleware.isAuth, [
  body('title', 'Title is required').trim().isLength({ min: 1 }).escape(),
  body('body', 'Content must not be empty').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('post_form', { errors: errors.array()});
      return;
    }

    const post = new Post({
      title: req.body.title,
      body: req.body.body,
      user: req.user._id,
      created_at: new Date().toISOString(),
  }).save(err => {
    if (err) { 
      return next(err);
    };
    res.redirect("/posts");
  });

    }
])

router.get("/delete/:id", authMiddleware.isAdmin, (req, res, next) => {
  Post.findById(req.params.id).exec(function (err, post) {
    if (err) { return next(err)}

    res.render("post_delete", {title: "Delete Item", post: post})
})
})

router.post("/delete/:id", authMiddleware.isAdmin, (req, res, next) => {
  Post.findByIdAndRemove(req.params.id, function deleteInstance(err) {
    if (err) {return next(err)}
    res.redirect("/posts")
})
})

router.get("/posts", authMiddleware.isAuth, function(req,res,next) {
  Post.find({}, 'title body')
      .populate('user')
      .exec(function (err, list_posts) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('posts', { list_posts: list_posts });
      });
})
module.exports = router;
