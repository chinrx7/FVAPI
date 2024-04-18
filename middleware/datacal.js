const { connectHDB,getDBH } = require('../storages/dbH');
const logger = require('../middleware/log');

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

    const MaxE = await colS.find({Name:Tag}).sort({ TimeStamp: -1 }).limit(1);
    let MaxTime;
    for await (const d of MaxE) {
        MaxTime = new Date(d.TimeStamp)
    }
    //console.log(colTime,MaxTime,Tag)
    STime = MaxTime;
    ETime = MaxTime;
    STime = new Date(STime.setMinutes(STime.getMinutes() - 2));
    ETime = new Date(ETime.setMinutes(ETime.getMinutes() + 1));


    const options = { projection: { _id: 0 } };

    let res = { Name: Tag, Records: [] };
    try{
    const dataS = await colS.findOne({ Name: Tag, TimeStamp: STime }, options);
    const dataE = await colS.findOne({ Name: Tag, TimeStamp: ETime }, options);

    res.Records.push({ TimeStamp: dataS.TimeStamp, Value: dataS.Value });
    res.Records.push({ TimeStamp: dataE.TimeStamp, Value: dataE.Value });
    }
    catch(ex){
        logger.loginfo(ex)
    }

    return res;

}

module.exports.getDataCalHour = async (Tag) => {
    const CTime = new Date;
    const spt = Tag.split('-');
    colTime = spt[0] + '_' + CTime.getFullYear() + '-' + padMon(CTime.getMonth() + 1);

    colS = dbH.collection(colTime);

    const MaxE = await colS.find().sort({ TimeStamp: -1 }).limit(1);
    let ETime;
    for await (const d of MaxE) {
        ETime = new Date(d.TimeStamp)
    }
    let STime =new Date(ETime);
    STime = STime.setMinutes(0,0,0);
    STime = new Date(STime);

    const options = { projection: { _id: 0 } };

    let res = { Name: Tag, Records: [] };
    const dataS = await colS.findOne({ Name: Tag, TimeStamp: STime }, options);
    const dataE = await colS.findOne({ Name: Tag, TimeStamp: ETime }, options);

    res.Records.push({ TimeStamp: dataS.TimeStamp, Value: dataS.Value });
    res.Records.push({ TimeStamp: dataE.TimeStamp, Value: dataE.Value });

    return res;

}

module.exports.getDataCalDay = async (Tag) => {
    const CTime = new Date;
    const spt = Tag.split('-');
    const colTime = spt[0] + '_' + CTime.getFullYear() + '-' + padMon(CTime.getMonth() + 1);


    const colS = dbH.collection(colTime);

    const MaxE = await colS.find({Name: Tag}).sort({ TimeStamp: -1 }).limit(1);
    let ETime;
    for await (const d of MaxE) {
        ETime = new Date(d.TimeStamp)
    }

    let STime =new Date(ETime);
    STime = new Date;
    STime = STime.setHours(0,0,0,0);
    STime = new Date(STime);

    //console.log(STime, ETime);

    const options = { projection: { _id: 0 } };

    let res = { Name: Tag, Records: [] };
    const dataS = await colS.findOne({ Name: Tag, TimeStamp: STime }, options);
    const dataE = await colS.findOne({ Name: Tag, TimeStamp: ETime }, options);

    if (dataS) {
        res.Records.push({ TimeStamp: dataS.TimeStamp, Value: dataS.Value });
    }
    if (dataE) {
        res.Records.push({ TimeStamp: dataE.TimeStamp, Value: dataE.Value });
    }

    return res;

}


module.exports.getFlowData = async (Vessel, Engines) => {
    let Treq = [];
    Engines.forEach(e => {
        const r = { Name : e, Tags:[] };
        Treq.push(Vessel + '-' + e + '-FIN-MFLOW');
        Treq.push(Vessel + '-' + e + '-FOUT-MFLOW');
        Treq.push(Vessel + '-' + e + '-FIN-DENS');
        Treq.push(Vessel + '-' + e + '-FOUT-DENS');
    });

    //console.log(Treq)
    colS = dbH.collection('Realtime');
    

    const options = { projection: { _id: 0 } };
    const query = { Name: { $in: Treq } };

    let res = [];
    const data = await colS.find(query, options);

    for await(d of data){
        res.push(d);
    }

    return res;

}

padMon = (monNum) => {
    let res = monNum;
    if (monNum < 10) {
        res = '0' + monNum;
    }
    return res;
}