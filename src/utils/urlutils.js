/**
 * Created by championswimmer on 13/03/17.
 */

module.exports = {
    prefixHttp: (url) => {
        if (url.substr(0, 4) != "http") {
            url = "http://" + url
        }
        return url
    }
}