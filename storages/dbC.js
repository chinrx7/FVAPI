const { MongoClient } = require('mongodb');
const { config } = require('../middleware/config');
const logger = require('../middleware/log');

const DBUrl = config.DBUrl + config.DBPrefix;

const authMechanism = '?authMechanism=DEFAULT'

const dbCUrl =  DBUrl + 'CFG' + authMechanism;

let dbCfgCon

module.exports = {
    connectCfgDB: (cb) => {
        MongoClient.connect(dbCUrl)
        .then((client) => {
            dbCfgCon = client.db()
            return cb()
        })
        .catch(err =>{
            logger.loginfo('con to cfg ' + err);
            return cb(err)
        })
    },
    getDBC:() => dbCfgCon
}



