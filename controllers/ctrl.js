const { config } = require('../middleware/config');
const tag = require('../middleware/tag');
const auth = require('../middleware/auth');
const dataServices = require('../middleware/data');
const ws = require('../middleware/web');
const logger = require('../middleware/log');

module.exports.test = async (req, res) => {
    tag.getTagConfigs();
}

module.exports.insertData = async (req, res) => {
    const token = req.headers["authorization"];
    if (token) {
        if (auth.ValidateToken(token)) {
            const data = req.body;
            if (data) {
                if (await dataServices.saveHisData(data) === true) {
                    res.status(200).json('Insert operation success!!!')
                }
            }
            else {
                res.status(400).json('Bad request!!!');
            }
        }
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
                    res.status(200).json("No tag that specified found!!!!")
                }
            }
        }
    }
}

module.exports.Authen = async (req, res) => {
    const { username, password } = req.body;

    const accToken = await auth.Authen(username, password);
    if (accToken) {
        res.status(200).json({ Access: { Token: accToken } });
    }
    else {
        res.status(403).json('Authentication failed');
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
        res.status(403).json("authorization haeders require!!!")
    }

}