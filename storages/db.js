const { MongoClient } = require('mongodb');
const { config } = require('../middleware/config');
const logger = require('../middleware/log');

const authMechanism = config.DBPrefix +  'CFG?authMechanism=DEFAULT'

const dbUrl =  "mongodb://dbadmin:password@localhost:27017/" + authMechanism;

let dbCfgCon

module.exports = {
    connectCfgDB: (cb) => {
        MongoClient.connect(dbUrl)
        .then((client) => {
            dbCfgCon = client.db()
            return cb()
        })
        .catch(err =>{
            logger.loginfo(err);
            return cb(err)
        })
    },
    getDBC:() => dbCfgCon
}



