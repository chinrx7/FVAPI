const express = require('express');
const cors = require('cors');
const route = require('./routes/route');
const { config } = require('./middleware/config');
const logger = require('./middleware/log');

const tag = require('./middleware/tag');


const app = express();

app.use(express.json({ limit: '100mb'} ));
app.use(cors({ origin: '*', credentials: true}));

app.listen(config.port);
app.use(route);
logger.loginfo('app running at port : ' + config.port)