const { config } = require('../middleware/config');
const tag = require('../middleware/tag');
const auth = require('../middleware/auth');
const dataServices = require('../middleware/data');

module.exports.test = async (req, res) => {
    tag.getTagConfigs();
}

module.exports.insertData = async (req, res) => {
    const token = req.headers["authorization"];
    if(token){
        if(auth.ValidateToken(token)){
            const data = req.body;
            if(data){
                if(dataServices.saveHisData(data) === true){
                    res.status(200).json('Insert operation success!!!')
                }
            }
            else{
                res.status(400).json('Bad request!!!');
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