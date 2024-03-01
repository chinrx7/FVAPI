const { connectHDB, getDBH } = require('../storages/dbH');
const logger = require('../middleware/log');

let dbH;

connectHDB((err) => {
    if (!err) {
        dbH = getDBH();
    }
});

module.exports.saveHisData = async (datas) => {
    try {
        const jStr = JSON.stringify(datas);
        const jData = JSON.parse(jStr);

        const docs = [];
        const cols = [];

        jData.forEach(j => {
            j.Records.forEach(r => {
                const docDate = new Date(r.TimeStamp);
                const colname = docDate.getFullYear() + '-' + padMon((docDate.getMonth() + 1));

                if (!cols.includes(colname)) {
                    cols.push(colname);
                }

                docs.push({ Name: j.Name, Value: r.Value, TimeStamp: r.TimeStamp, Colname: colname });
            })
        });

        const insertDocs = [];
        cols.forEach(col => {
            const fillData = docs.fill(function (docs) {
                return docs.Colname.toString().includes(col);
            });
            insertDocs.push({ colName: col, rec: fillData })
        })

        if(insertDocs){
            this.saveHisData(insertDocs);
        }
    }
    catch (err) {
        logger.loginfo('save his data ' + err);
    }
}

saveHisToDB = async (docs) => {
    chkCol = async (colname) => {
        let res = false;
        const cList = await dbH.listCollections().toArray();
        cList.forEach(c => {
            if (c.name === colname) {
                res = true;
            }
        });
        return res;
    }

    try{
        docs.forEach(async d => {
            const chk = await chkCol(d.Colname);
            if(!res){
                await createTimeCols(d.Colname);
            }

            const cols  = dbh.collection(d.Colname);
            let record = [];
            d.rec.forEach(r => {
                record.push({ Name: r.Name, Value: r.Value, TimeStamp: new Date(r.TimeStamp)})
            });

            cols.insertMany(record);
            return true;
        });
    }
    catch(err){
        logger.loginfo('Save His to DB ' + err);
        return false;
    }
}

padMon = (monNum) => {
    let res = monNum;
    if (monNum < 10) {
        res = '0' + monNum;
    }
    return res;
}

createTimeCols = async (CName) => {
    await dbH.createCollection(CName, {
        timeseries: {
            timeField: 'TimeStamp',
            metaField: 'metadata'
        }
    })
}