const { config } = require('../middleware/config');
const tag = require('../middleware/tag');
const auth = require('../middleware/auth');
const dataServices = require('../middleware/data');
const ws = require('../middleware/web');
const logger = require('../middleware/log');

module.exports.test = async (req, res) => {
    tag.getTagConfigs();
}

module.exports.getTagConfigure = async (req,res) => {
    if(config.Debug === 'true'){
        logger.loginfo("get tag configs");
    }
    const token = req.headers["authorization"];
    if(token){
        if(auth.ValidateToken(token)){
            const { VID } = req.body;
            const tags = await ws.getTagsConfig(VID);
            if(tags){
                res.status(200).json(tags);
            }
            else{
                res.status(200).json("No tag configure found!!!");
            }
        }
        else{
            res.status(403).json('not authorized');
        }
    }
    else{
        res.status(403);
    }
}

module.exports.insertData = async (req, res) => {
    if(config.Debug === "true"){
        logger.loginfo("insert historian data");
    }
    const token = req.headers["authorization"];
    if (token) {
        if (auth.ValidateToken(token)) {
            const data = req.body;
            if (data) {
                if (await dataServices.saveHisData(data) === true) {
                    res.status(200).json('Insert operation success!!!');
                }
            }
            else {
                res.status(400).json('Bad request!!!');
            }
        }
        else{
            res.status(403).json('not authorized');
        }
    }
}

module.exports.updateRealtime = async (req,res) => {
    if(config.Debug === "true"){
        logger.loginfo("update Realtime");
    }
    const token = req.headers["authorization"];
    if(token){
        if(auth.ValidateToken(token)){
            const tags = JSON.parse(JSON.stringify(req.body));
            if(await dataServices.UpdateRealTime(tags) === true){
                res.status(200).json('Update realtime success');
            }
            else{
                res.status(200).json('Update failed')
            }
        }
        else{
            res.status(401).json('not authorized');
        }
    }
    else{
        res.status(400).json('bad request');
    }
}

module.exports.getvesselcurrentInfo = async (req, res) => {
    if (config.Debug === "true") {
        logger.loginfo("getVessel info")
    }
    const token = req.headers["authorization"];
    if (token) {
        if (auth.ValidateToken(token)) {
            const vessel = await ws.getVesselInfo();
            if (vessel) {
                res.status(200).json(vessel);
            }
            else {
                res.status(200).json('No vessel found!!!')
            }
        }
        else{
            res.status(401).json('not authorized');
        }
    }
    else{
        res.status(400).json('bad request');
    }
}

module.exports.getcurrentvalues = async (req, res) => {
    if (config.Debug === "true") {
        logger.loginfo("get current value");
    }
    const token = req.headers["authorization"];
    if(token){
        if(auth.ValidateToken(token)) {
            if(req.body){
                const tagReqest = JSON.parse(JSON.stringify(req.body));
                const realtime = await ws.getcurrentvalues(tagReqest);
                if(realtime){
                    res.status(200).json(realtime);
                }
                else{
                    res.status(200).json("No tag that specified found!!!!");
                }
            }
            else{
                res.status(400).json("Invalid request!!!");
            }
        }
        else{
            res.status(401).json('not authorized');
        }
    }
    else{
        res.status(400).json('bad request');
    }
}

module.exports.getChartValues = async (req, res) => {
    if(config.Debug === 'true'){
        logger.loginfo('get chart value');
    }
    const token = req.headers["authorization"];
    if(token){
        if(auth.ValidateToken(token)){
            if(req.body){
                const { StartTime, EndTime, Tags } = req.body;
                let Datas = [];
                Tags.forEach(async t => {
                    const rec = await ws.getChartData(t, StartTime, EndTime);
                    if(rec){ Datas.push(rec); }
                    if(Tags.length === Datas.length){
                        res.status(200).json(Datas);
                    }
                });
            }
            else{
                res.status(400).json('Invalid request!!!');
            }
        }
        else{
            res.status(401).json('not authorized');
        }
    }
    else{
        res.status(400).json('bad request');
    }
}

module.exports.getHisvalues = async (req, res) => {
    if(config.Debug === 'true'){
        logger.loginfo("get Historian value")
    }
    const token = req.headers["authorization"];
    if(token){
        if(auth.ValidateToken(token)){
            if(req.body){
                const { StartTime, EndTime, Tags } = req.body;
                
                let Datas = [];
                Tags.forEach(async t => {
                    const rec = await ws.getHisData(t,StartTime,EndTime);
                    if(rec){ Datas.push(rec); }
                    if(Tags.length === Datas.length){
                        const tran = ws.tranfromHisData(Datas);
                        res.status(200).json(tran)
                    }
                });
            }
            else{
                res.status(400).json("Invalid request!!!");
            }
        }
        else{
            res.status(401).json('not authorized');
        }
    }
    else{
        res.status(400).json('bad request');
    }
}

module.exports.Authen = async (req, res) => {
    const { username, password } = req.body;

    const accToken = await auth.Authen(username, password);
    if (accToken) {
        res.status(200).json({ Access: { Token: accToken } });
    }
    else {
        res.status(401).json('Authentication failed');
    }
}

module.exports.login = async (req, res) => {
    const token = req.headers["authorization"];
    const chk = false;
    if (token) {
        if (auth.ValidateToken(token)) {
            chk = true;
            res.status(200).json(chk);
        }
        else {
            res.status(403).json(chk);
        }
    }
    else {
        res.status(400).json("bad request")
    }

}