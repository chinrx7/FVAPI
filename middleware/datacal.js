const { connectHDB,getDBH } = require('../storages/dbH');

let dbH;

connectHDB((err) => {
    if (!err) {
        dbH = getDBH();
    }
});

module.exports.getDataCal = async (Tag, SPTime) => {
    SPTime.setSeconds(0, 0);
    SPTime = new Date(SPTime);
    let STime, ETime;


    const spt = Tag.split('-');

    let colTime, colS;
    colTime = spt[0] + '_' + SPTime.getFullYear() + '-' + padMon(SPTime.getMonth() + 1);

    colS = dbH.collection(colTime);

    const MaxE = await colS.find().sort({ TimeStamp: -1 }).limit(1);
    let MaxTime;
    for await (const d of MaxE) {
        MaxTime = new Date(d.TimeStamp)
    }

    STime = MaxTime;
    ETime = MaxTime;
    STime = new Date(STime.setMinutes(STime.getMinutes() - 2));
    ETime = new Date(ETime.setMinutes(ETime.getMinutes() + 1));


    const options = { projection: { _id: 0 } };

    let res = {Name:Tag, Records:[]}
    const dataS = await colS.findOne({ Name: Tag, TimeStamp: STime }, options);
    const dataE = await colS.findOne({ Name: Tag, TimeStamp: ETime }, options);

    res.Records.push({TimeStamp: dataS.TimeStamp, Value: dataS.Value});
    res.Records.push({TimeStamp: dataE.TimeStamp, Value: dataE.Value});

    return res;

}

padMon = (monNum) => {
    let res = monNum;
    if (monNum < 10) {
        res = '0' + monNum;
    }
    return res;
}