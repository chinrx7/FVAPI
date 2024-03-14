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
    if(!err){
        dbH = getDBH();
    }
})

module.exports.getVesselInfo = async () => {
    const cols = dbC.collection("VESSEL_INFO");
    let vessel = [];

    const query = {};
    const options = { projection: { _id: 0}};

    const Tzone = "UTC+7";

    const vs  = await cols.find(query,options);
    for await (const data of vs){
        //console.log(data)
        const position = await getVesselPosition(data.Prefix);
        const v  = { id: data.SourceID, name: data.Name, prefix: data.Prefix, image: data.Images, timestamp: Tzone, lattitude:position.lattitude, longtitude: position.longtitude, description: data.Description };
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

    const data = await realtime.find(query,options);

    for await (const d of data){
        if(d.Name === NameLAT){
            postion.lattitude = d.Value;
        }
        else{
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
    const options = { projection: { _id:0 } };

    const realtime = dbH.collection("Realtime");

    const data = await realtime.find(query, options);
    for await(d of data){
        res.push(d)
    }
    return res;
}