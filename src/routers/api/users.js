/**
 * Created by championswimmer on 10/03/17.
 *
 * This is the /api/v1/users path
 */
const router = require('express').Router()
const cel = require('connect-ensure-login')
const passport = require('../../passport/passporthandler')
const models = require('../../db/models').models


router.get('/me',
    // Frontend clients can use this API via session (using the '.codingblocks.com' cookie)
    passport.authenticate(['bearer', 'session']),
    (req, res) => {

        if (req.user && req.user.id) {
            let includes = []
            if (req.query.include) {
                let includedAccounts = req.query.include.split(',')
                for (ia of includedAccounts) {
                    switch (ia) {
                        case 'facebook':
                            includes.push({ model: models.UserFacebook, attributes: {exclude: ["accessToken","refreshToken"]}})
                            break
                        case 'twitter':
                            includes.push({ model: models.UserTwitter, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'github':
                            includes.push({ model: models.UserGithub, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'google':
                            includes.push({model: models.UserGoogle, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'lms':
                            includes.push({ model: models.UserLms, attributes: {exclude: ["accessToken"]}})
                            break
                    }
                }
            }


            models.User.findOne({
                where: {id: req.user.id},
                include: includes
            }).then((user) => {
                if (!user) {
                    throw new Error("User not found")
                }
                res.send(user)
            }).catch((err) => {
                res.send('Unknown user or unauthorized request')
            })

        } else {
            return res.sendStatus(403)
        }

    })

router.get('/me/address',
    // Frontend clients can use this API via session (using the '.codingblocks.com' cookie)
    passport.authenticate(['bearer', 'session']),
    (req, res) => {
        if (req.user && req.user.id) {
            let includes = [{model: models.Demographic,
            include: [models.Address]
            }]
            if (req.query.include) {
                let includedAccounts = req.query.include.split(',')
                for (ia of includedAccounts) {
                    switch (ia) {
                        case 'facebook':
                            includes.push({ model: models.UserFacebook, attributes: {exclude: ["accessToken","refreshToken"]}})
                            break
                        case 'twitter':
                            includes.push({ model: models.UserTwitter, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'github':
                            includes.push({ model: models.UserGithub, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'google':
                            includes.push({model: models.UserGoogle, attributes: {exclude: ["token","tokenSecret"]}})
                            break
                        case 'lms':
                            includes.push({ model: models.UserLms, attributes: {exclude: ["accessToken"]}})
                            break
                    }
                }
            }


            models.User.findOne({
                where: {id: req.user.id},
                include: includes
            }).then((user) => {
                console.log(user)
                if (!user) {
                    throw new Error("User not found")
                }
                res.send(user)
            }).catch((err) => {
                res.send('Unknown user or unauthorized request')
            })
        } else {
            return res.sendStatus(403)
        }

    })


router.get('/me/logout',
    passport.authenticate('bearer', {session: false}),
    (req, res) => {
        if (req.user && req.user.id) {
            models.AuthToken.destroy({
                where: {
                    token: req.header('Authorization').split(' ')[1]
                }
            }).then(() => {
                res.status(202).send({
                    'user_id': req.user.id,
                    'logout': 'success'
                })
            }).catch((err) => {
                res.status(501).send(err)
            })
        } else {
            res.status(403).send("Unauthorized")
        }
    }
)

router.get('/:id',
    passport.authenticate('bearer', {session: false}),
    (req, res) => {
        if (req.user && req.user.id) {
            if (req.params.id == req.user.id) {
                return res.send(req.user)
            }
        }
        let trustedClient = req.client && req.client.trusted
        models.User.findOne({
            // Public API should expose only id, username and photo URL of users
            // But for trusted clients we will pull down our pants
            attributes: trustedClient ? undefined: ['id', 'username', 'photo'],
            where: {id: req.params.id}
        }).then((user) => {
            if (!user) {
                throw new Error("User not found")
            }
            res.send(user)
        }).catch((err) => {
            res.send('Unknown user or unauthorized request')
        })
    }
)
router.get('/:id/address',
    // Only for server-to-server calls, no session auth
    passport.authenticate('bearer', {session: false}),
    (req, res) => {
        let includes = [{model: models.Demographic,
            include: [{model: models.Address, include:[models.State, models.Country]}]
        }]

        models.Address.findAll({
            where: {'$demographic.userId$': req.params.id},
            include: includes
        }).then((addresses) => {
            if (!addresses || addresses.length === 0) {
                throw new Error("User has no addresses")
            }
            return res.json(addresses)
        }).catch((err) => {
            Raven.captureException(err)
            req.flash('error', 'Something went wrong trying to query address database')
            return res.status(501).json({error: err.message})
        })
    }
)

module.exports = router
