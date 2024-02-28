//const { MongoClient } = require('mongodb');
const { connectCfgDB,getDBC} = require('../storages/db');
const { config } = require('./config');


let db;

connectCfgDB((err) => {
    if(!err){
        db = getDBC();
    }
})

module.exports.getTagConfigs = async () => {
    const cols = db.collection('TAGS_CFG');

    const cursors = await cols.find();
    for await(tag of cursors){
        console.log(tag)
    }
}