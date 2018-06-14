function ensureAdmin(req, res, next) {
    if ((req.user.role === 'admin')) {
        next()
    } else {
        res.status(403).send({error: 'Unauthorized'})
    }
}

function ensureRole(role) {
    return (req, res, next) => {
        if (req.user.role === role) {
            next()
        } else {
            res.status(403).send({error: 'Unauthorized'})
        }
    }
}

module.exports = {
    ensureAdmin,
    ensureRole,
}