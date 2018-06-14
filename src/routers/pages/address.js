const router = require('express').Router()
const cel = require('connect-ensure-login')
const Raven = require('raven')

const models = require('../../db/models').models

router.get('/',
    cel.ensureLoggedIn('/login'),
    (req, res, next) => {
        models.Address.findAll({
            where: {'$demographic.userId$': req.user.id},
            include: [models.Demographic]
        }).then((addresses) => {
            return res.render('address/all', {addresses})
        }).catch((err) => {
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.redirect('/users/me')
        })
    }
)

router.get('/add',
    cel.ensureLoggedIn('/login'),
    (req, res, next) => {
        Promise.all([
            models.State.findAll({}),
            models.Country.findAll({})
        ]).then(([states, countries]) => {
            return res.render('address/add', {states, countries})
        }).catch((err) => {
            res.send("Error Fetching Data.")
        })
    }
)

router.get('/:id',
    cel.ensureLoggedIn('/login'),
    (req, res, next) => {
        models.Address.findOne({
            where: {
                id: req.params.id,
                '$demographic.userId$': req.user.id
            },
            include: [models.Demographic, models.State, models.Country]
        }).then((address) => {
            if (!address) {
                req.flash('error', 'Address not found')
                return res.redirect('.')
            }
            return res.render('address/id', {address})
        }).catch((err) => {
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.redirect('/users/me')
        })
    }
)


router.get('/:id/edit',
    cel.ensureLoggedIn('/login'),
    (req, res, next) => {
        Promise.all([
            models.Address.findOne({
                where: {
                    id: req.params.id,
                    '$demographic.userId$': req.user.id
                },
                include: [models.Demographic, models.State, models.Country]
            }),
            models.State.findAll({}),
            models.Country.findAll({})
        ]).then(([address, states, countries]) => {
            if (!address) {
                req.flash('error', 'Address not found')
                return res.redirect('.')
            }
            return res.render('address/edit', {address, states, countries})
        }).catch((err) => {
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.redirect('/users/me')
        })
    }
)

module.exports = router
