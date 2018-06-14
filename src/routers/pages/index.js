/**
 * Created by championswimmer on 13/03/17.
 */
const router = require('express').Router()
const publicroute = require('./public')
    , userroute = require('./user')
    , clientroute = require('./client')
    , addressroute = require('./address')
    , forgotroute = require('./forgot')
    , approute = require('./apps')
const makeGaEvent = require('../../utils/ga').makeGaEvent


router.use((req, res, next) => {
    // One '!' doesn't cancel the other'!'. This is not wrong code. Learn JS
    res.locals.loggedIn = !!req.user
    res.locals.userRole = req.user && req.user.role
    res.locals.userId = req.user && req.user.id
    next()
})

router.use('/', makeGaEvent('view', 'page', '/'), publicroute)
router.use('/users', makeGaEvent('view', 'page', '/users'), userroute)
router.use('/clients', makeGaEvent('view', 'page', '/clients'), clientroute)
router.use('/address', makeGaEvent('view', 'page', '/address'), addressroute)
router.use('/forgot', makeGaEvent('view', 'page', '/forgot'), forgotroute)
router.use('/apps', makeGaEvent('view', 'page', '/apps'), approute)


module.exports = router
