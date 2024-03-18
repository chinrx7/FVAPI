const { connectCfgDB, getDBC } = require('../storages/dbC');
const { connectHDB, getDBH } = require('../storages/dbH');
const logger = require('../middleware/log');

let dbC, dbH;

connectCfgDB((err) => {
    if (!err) {
        dbC = getDBC();
    }
});

connectHDB((err) => {
    if (!err) {
        dbH = getDBH();
    }
})

module.exports.getVesselInfo = async () => {
    const cols = dbC.collection("VESSEL_INFO");
    let vessel = [];

    const query = {};
    const options = { projection: { _id: 0 } };

    const Tzone = "UTC+7";

    const vs = await cols.find(query, options);
    for await (const data of vs) {
        //console.log(data)
        const position = await getVesselPosition(data.Prefix);
        const v = { id: data.SourceID, name: data.Name, prefix: data.Prefix, image: data.Images, timestamp: Tzone, lattitude: position.lattitude, longtitude: position.longtitude, description: data.Description };
        vessel.push(v)
    }

    return vessel;
}

getVesselPosition = async (VesselName) => {
    const postion = { lattitude: 0, longtitude: 0 };

    const NameLAT = VesselName + "-VES-GPS-LAT";
    const NameLONG = VesselName + "-VES-GPS-LONG";

    let find = [];
    find.push(NameLAT);
    find.push(NameLONG);

    const query = { Name: { $in: find } };
    const options = { projection: { _id: 0 } };

    const realtime = dbH.collection("Realtime");

    const data = await realtime.find(query, options);

    for await (const d of data) {
        if (d.Name === NameLAT) {
            postion.lattitude = d.Value;
        }
        else {
            postion.longtitude = d.Value;
        }
    }


    return postion;
}

module.exports.getcurrentvalues = async (req) => {
    let res = [];

    let find = [];
    req.Name.forEach(r => {
        find.push(r);
    });

    const query = { Name: { $in: find } };
    const options = { projection: { _id: 0 } };

    const realtime = dbH.collection("Realtime");

    const data = await realtime.find(query, options);
    for await (d of data) {
        res.push(d)
    }
    return res;
}

module.exports.getDataLogger = async (Tags, STime, ETime) => {

    let Datas = [];

    Tags.forEach(async T => {
        const rec = await getHisData(T, STime, ETime);
        Datas.push(rec);
    });
}

tranfromHisData = (datas) => {
    const trans = { Headers: [], Values: [] };

    datas.forEach(d => {

    });
}

getHisData = async (Tag, STime, ETime) => {
    const MonDiff = ETime.getMonth() - STime.getMonth();
    const YrDiff = ETime.getFullYear() - STime.getFullYear();

    let rec = { Name: Name, records: [] };
    const options = { sort: { TimeStamp: 1 }, projection: { _id: 0 } };

    const spt = Tag.split('-');

    if (YrDiff === 0) {
        if (MonDiff === 0) {
            const colName = STime.getFullYear() + "-" + padMon(STime.getMonth() + 1);
            colName = spt[0] + "_" + colName;

            const col = dbH.collection(colName);

            const query = { Name: Tag, TimeStamp: { $gte: new Date(STime), $lte: new Date(ETime) } };

            const data = await col.find(query, options)

            for await (const d of data) {
                rec.records.push({ Value: d.value, TimeStamp: d.TimeStamp });
            }
        }
        else {
            for (let i = STime.getMonth(); i <= ETime.getMonth(); i++) {
                let SFTime, EFTime;
                if (i === SFTime.getMonth()) {
                    SFTime = STime;
                    EFTime = new Date(STime.getFullYear(), STime.getMonth() + 1, 0).setHours(23, 59, 59, 999);
                }
                else if (i === ETime.getMonth()) {
                    SFTime = new Date(ETime.getFullYear(), ETime.getMonth(), 1);
                    EFTime = ETime;
                }
                else {
                    SFTime = new Date(STime.getFullYear(), i, 1);
                    EFTime = new Date(STime.getFullYear(), i + 1, 0).setHours(23, 59, 59, 999);
                }

                SFTime = new Date(SFTime);
                EFTime = new Date(EFTime);

                if (SFTime && EFTime) {
                    const colName = spt[0] + "_" + SFTime.getFullYear() + "-" + padMon(SFTime.getMonth() + 1);

                    const query = { Name: Name, TimeStamp: { $gte: new Date(SFTime), $lte: new Date(EFTime) } };

                    const cols = dbH.collection(colName);

                    const data = await cols.find(query, options);

                    for await (const d of data) {
                        rec.records.push({ Value: d.value, TimeStamp: d.TimeStamp });
                    }
                }
            }
        }
    }
    else {
        let SYTime, EYTime, cName;
        let datarecs = [];

        let colName;

        for (let i = STime.getFullYear(); i <= ETime.getFullYear(); i++) {
            if (i === STime.getFullYear()) {
                for (let x = STime.getMonth(); x <= 11; x++) {
                    if (x === STime.getMonth()) {
                        SYTime = STime;
                        EYTime = new Date(i, STime.getMonth() + 1, 0).setHours(23, 59, 59, 999);
                        EYTime = new Date(EYTime);
                    }
                    else if (x === 11) {
                        SYTime = new Date(i, x, 1);
                        EYTime = new Date(i + 1, 0, 0).setHours(23, 59, 59, 999);
                        EYTime = new Date(EYTime);
                    }
                    else {
                        SYTime = new Date(i, x, 1);
                        EYTime = new Date(i, x + 1, 0).setHours(23, 59, 59, 999);
                        EYTime = new Date(EYTime);
                    }

                    colName = spt[0] + "_" + i + "_" + padMon(x + 1);
                    const data = await queryData(colName, Tag, SYTime, EYTime);
                    if (data.lenght > 0) {
                        datarecs.push(data);
                    }

                }
            }
            else if (i === ETime.getFullYear()) {
                for (let x = 0; x <= ETime.getMonth(); x++) {
                    if (x === 0) {
                        SYTime = new Date(i, x, 1);
                        EYTime = new Date(i, x + 1, 0, 23, 59, 59, 999);
                    }
                    else if (x === ETime.getMonth()) {
                        SYTime = new Date(i, x, 1);
                        EYTime = ETime;
                    }
                    else {
                        SYTime = new Date(i, x, 1);
                        EYTime = new Date(i, x + 1, 0, 23, 59, 59, 999);
                    }
                    colName = spt[0] + "_" + i + "_" + padMon(x + 1);
                    const data = await queryData(colName, Tag, SYTime, EYTime);
                    if (data.lenght > 0) {
                        datarecs.push(data);
                    }

                }
            }
            else{
                for (let x = 0; x <= 11; x++) {
                    if (x !== 11) {
                        SYTime = new Date(i, x, 1);
                        EYTime = new Date(i, x + 1, 0, 23, 59, 59, 999);
                    }
                    else {
                        SYTime = new Date(i, x, 1);
                        EYTime = new Date(i + 1, 0, 0, 23, 59, 59, 999);
                    }
                    colName = spt[0] + "_" + i + "_" + padMon(x + 1);
                    const data = await queryData(colName, Tag, SYTime, EYTime);
                    if (data.lenght > 0) {
                        datarecs.push(data);
                    }
                }
            }
        }
    }

    if (rec) {
        return rec;
    }
}

queryData = async (cName, Name, Sd, Ed) => {
    try {
        const cols = dbH.collection(cName);

        const query = { Name: Name, TimeStamp: { $gte: new Date(Sd), $lte: new Date(Ed) } };
        const options = { sort: { TimeStamp: 1 }, projection: { _id: 0 } };

        const data = await cols.find(query, options);

        let res = [];
        for await (const d of data) {
            res.push({ Value: d.Value, TimeStamp: d.TimeStamp });
        }
        return res;
    }
    catch (err) {
        console.log(err);
    }

}

padMon = (monNum) => {
    let res = monNum;
    if (monNum < 10) {
        res = '0' + monNum;
    }
    return res;
}