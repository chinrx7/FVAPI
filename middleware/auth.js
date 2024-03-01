const { connectCfgDB, getDBC } = require('../storages/dbC');
const { config } = require('../middleware/config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let dbC;

connectCfgDB((err) => {
    if(!err){
        dbC = getDBC();
    }
});

module.exports.Authen = async (user, password) => {
    const usrs = dbC.collection('SYSTEM_USERS');
    const exist = await usrs.findOne({ UserName: user});

    if(exist){
        const auth = await bcrypt.compare(password, exist.Password);
        if(auth){
            return GenToken(exist);
        }
    }
}

const GenToken = (user) => {
    const accessToken  = jwt.sign(
        {
            UserName: user.UserName,
            _id: user._id
        },
        config.Secret,
        {
            expiresIn: config.SYSTEMToken, algorithm: "HS256"
        }
    )

    return accessToken;
}

module.exports.ValidateToken = (token) => {
    let res;
    jwt.verify(token, config.Secret, (err, decode) => {
        if(!err){
            res = true;
        }
        else{
            res = false;
        }
    });

    return res;
}
