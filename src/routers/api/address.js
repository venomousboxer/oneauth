const router = require('express').Router()
const {db, models} = require('../../db/models')
const generator = require('../../utils/generator')
const cel = require('connect-ensure-login')
const Raven = require('raven')
const urlutils = require('../../utils/urlutils')
const {hasNull} = require('../../utils/nullCheck')

router.post('/', cel.ensureLoggedIn('/login'), (req, res) => {
    if (hasNull(req.body, ['label', 'first_name', 'last_name', 'number', 'email', 'pincode', 'street_address', 'landmark', 'city', 'stateId', 'countryId'])) {
        res.send(400)
    } else {
        if (req.query) {
         var redirectUrl = req.query.returnTo;
        }
        models.Demographic.findCreateFind({
            where: {userId: req.user.id},
            include: [models.Address]
        }).then(([demographics, created]) => models.Address.create({
            label: req.body.label,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            mobile_number: req.body.number,
            email: req.body.email,
            pincode: req.body.pincode,
            street_address: req.body.street_address,
            landmark: req.body.landmark,
            city: req.body.city,
            stateId: req.body.stateId,
            countryId: req.body.countryId,
            demographicId: demographics.id,
            // if no addresses, then first one added is primary
            primary: !demographics.get().addresses
        }))
            .then((address) => {
                if (req.body.returnTo) {
                    res.redirect(req.body.returnTo)
                } else{
                    res.redirect('/address/' + address.id)
                }
            })
            .catch(err => {
                Raven.captureException(err)
                req.flash('error', 'Error inserting Address')
                res.redirect('/users/me')
            })
    }
})

router.post('/:id', cel.ensureLoggedIn('/login'), async (req, res) => {
    if (hasNull(req.body, ['label', 'first_name', 'last_name', 'number', 'email', 'pincode', 'street_address', 'landmark', 'city', 'stateId', 'countryId'])) {
        return res.send(400)
    }
    let addrId = parseInt(req.params.id)
    let userId = parseInt(req.user.id)


    try {
        await db.transaction(async (t) => {
            if (req.body.primary === 'on') {

                let demo = await models.Demographic.findOne({where: {userId: req.user.id}})
                let demoId = demo.id
                await models.Address.update(
                    {primary: false},
                    {where: {demographicId: demoId}}
                )
            }

            await models.Address.update({
                    label: req.body.label,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    mobile_number: req.body.number,
                    email: req.body.email,
                    pincode: req.body.pincode,
                    street_address: req.body.street_address,
                    landmark: req.body.landmark,
                    city: req.body.city,
                    stateId: req.body.stateId,
                    countryId: req.body.countryId,
                    primary: req.body.primary === 'on'
                },
                { where: {id: addrId} }
            )
            return res.redirect(`/address/${addrId}`)
        })

    } catch (err) {
        Raven.captureException(err)
        req.flash('error', 'Could not update address')
        res.redirect('/address')
    }

})


module.exports = router

