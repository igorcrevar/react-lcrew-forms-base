if (process.env.NODE_ENV === 'production') {
    module.exports = require("./dist/lcrew-forms-base.min.js");
}
else if (process.env.NODE_ENV === 'development') {
    module.exports = require('./dist/lcrew-forms-base.dev.js');
}
else {
    module.exports = require('./src/index.js')
}