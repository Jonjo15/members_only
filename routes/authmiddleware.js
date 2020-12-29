exports.isAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect("/login")
    }
    else {
        next()
    }
}
exports.alreadyLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/profile")
    }
    else {
        next()
    }
}
exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        next()
    }
    else {
        res.redirect("/login")
    }
}