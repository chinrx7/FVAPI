const { MongoClient } = require('mongodb');
const { config } = require('../middleware/config');
const logger = require('../middleware/log');

const DBUrl = config.DBUrl + config.DBPrefix;

const authMechanism = '?authMechanism=DEFAULT'

const dbHUrl =  DBUrl + 'HIS' + authMechanism;

console.log(dbHUrl)

let dbH;

module.exports = {
    connectHDB: (cb) => {
        MongoClient.connect(dbHUrl)
            .then((client) => {
                dbH = client.db()
                return cb()
            })
            .catch(err => {
                logger.loginfo('con to his ' + err);
                return cb(err)
            })
    },
    getDBH:() => dbH
}