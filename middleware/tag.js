//const { MongoClient } = require('mongodb');
const { connectCfgDB, getDBC } = require('../storages/dbC');
const { config } = require('./config');


let dbC;

connectCfgDB((err) => {
    if(!err){
        dbC = getDBC();
    }
})


//console.log(db)

module.exports.getTagConfigs = async () => {
    const cols = dbC.collection('TAGS_CFG');

    const cursors = await cols.find();
    for await (tag of cursors) {
        console.log(tag)
    }
}