const { connectHDB, getDBH } = require('../storages/dbH');
const logger = require('../middleware/log');

let dbH;

connectHDB((err) => {
    if (!err) {
        dbH = getDBH();
    }
});

module.exports.UpdateRealTime = async (realtime) => {
    let insData = [];
    let upData = [];

    let res = false;

    const SName = realtime[0].Name.split('-');

    try {
        realtime.forEach(async r => {
            const exist = await CheckRealtimeExist(r.Name);
            if (exist) {
                upData.push(tranFromData(r));
            }
            else {
                insData.push(tranFromData(r));
            }

            if (realtime.length === (insData.length + upData.length)) {
                await UpdateRealtimeData(insData, upData);
            }
        });
        res = true;
    }
    catch (err) {
        logger.loginfo(SName[0] + "Update realtime : " + err);
    }

    return res;
}

tranFromData = (rec) => {
    let res;
    res = { Name: rec.Name, Value: rec.Value, Unit: rec.Unit, TimeStamp: new Date(rec.TimeStamp) }
    return res;
}

CheckRealtimeExist = async (Name) => {
    let res = false;

    const cols = dbH.collection("Realtime");

    const doc = await cols.findOne({ Name: Name });

    if (doc != null) {
        res = true;
    }

    return res;

}

UpdateRealtimeData = async (insertdata, updatedata) => {
    let res = false;
    let SName
    if (updatedata.length>0) {
        SName = updatedata[0].Name.split('-');
    }
    else {
        SName = insertdata[0].Name.split('-');
    }

    try {
        const cols = dbH.collection("Realtime");

        if (insertdata.length > 0) {
            cols.insertMany(insertdata);
        }


        if (updatedata.length > 0) {
            updatedata.forEach(u => {
                cols.updateOne(
                    { Name: u.Name },
                    {
                        $set: {
                            Value: u.Value,
                            TimeStamp: u.TimeStamp
                        }
                    }
                )
            });
        }

        res = true;

        return res;
    }
    catch (err) {
        logger.loginfo(SName[0] + "Update realtime data : " + err);
    }
}

module.exports.saveHisData = async (datas) => {
    try {
        const jStr = JSON.stringify(datas);
        const jData = JSON.parse(jStr);

        //console.log(jData)

        const docs = [];
        const cols = [];


        if (jData.length > 0) {
            jData.forEach(j => {
                j.Records.forEach(r => {
                    const docDate = new Date(r.TimeStamp);

                    let spt = j.Name.split('-');
                    const colname = spt[0] + "_" + docDate.getFullYear() + '-' + padMon((docDate.getMonth() + 1));

                    //console.log(colname)

                    if (!cols.includes(colname)) {
                        cols.push(colname);
                    }

                    const rec = { Name: j.Name, Value: r.Value, TimeStamp: r.TimeStamp, Colname: colname };

                    //console.log(rec)

                    docs.push(rec);
                })
            });
        }

        //console.log(cols)
        // console.log(docs)

        const insertDocs = [];
        cols.forEach(col => {
            //console.log(docs.TimeStamp.toString().includes(col))

            const fillData = docs.filter(function (docs) {
                return docs.Colname.toString().includes(col);
            });
            //console.log(fillData)
            insertDocs.push({ colName: col, rec: fillData })
        });

        //console.log(insertDocs)

        if (insertDocs.length>0) {
            saveHisToDB(insertDocs);
        }

        return true;
    }
    catch (err) {
        logger.loginfo('save his data ' + err);
        return false;
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

    try {
        docs.forEach(async d => {
            const chk = await chkCol(d.colName);
            if (!chk) {
                await createTimeCols(d.colName);
            }

            const cols = dbH.collection(d.colName);
            let record = [];
            d.rec.forEach(r => {
                record.push({ Name: r.Name, Value: r.Value, TimeStamp: new Date(r.TimeStamp) })
            });

            cols.insertMany(record);
            return true;
        });
    }
    catch (err) {
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