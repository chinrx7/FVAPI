const { config } = require('../middleware/config');
const tag = require('../middleware/tag')

module.exports.test = async (req,res) => {
    tag.getTagConfigs();
}