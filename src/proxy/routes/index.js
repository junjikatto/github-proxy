/* eslint-disable max-len */
const express = require('express');
const proxy = require('express-http-proxy');
// eslint-disable-next-line new-cap
const router = express.Router();
const chain = require('../chain');

router.use('/', proxy('https://github.com', {
  filter: async function(req, res) {
    try {
      if (req.body && req.body.length) {
        req.rawBody = req.body.toString('utf8');
      }

      const action = await chain.exec(req, res);

      if (action.error || action.blocked) {
        res.set('content-type', 'application/x-git-receive-pack-result');
        res.set('transfer-encoding', 'chunked');
        res.set('expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
        res.set('pragma', 'no-cache');
        res.set('cache-control', 'no-cache, max-age=0, must-revalidate');
        res.set('vary', 'Accept-Encoding');
        res.set('x-frame-options', 'DENY');
        res.set('connection', 'close');

        let message;

        if (action.error) {
          message = action.errorMessage;
        }
        if (action.blocked) {
          message = action.blockedMessage;
        }

        // ERROR PCT LINE -- MOVE THIS TO HELPER
        const errorMessage = `ERR\t${message}`;
        const len = 6 + errorMessage.length;

        const prefix = len.toString(16);
        const packetMessage = `00${prefix}\x02${errorMessage}\n0000`;

        console.log(packetMessage);

        res.status(200).send(packetMessage);

        return false;
      }

      return true;
    } catch (e) {
      console.error(e.stack || e);
      return false;
    }
  },
  userResDecorator: function(proxyRes, proxyResData) {
    // const data = proxyResData;
    // const ts = Date.now();
    // fs.writeFileSync(`./.logs/responses/${ts}.${proxyRes.statusCode}.status`, proxyRes.statusCode);
    // fs.writeFileSync(`./.logs/responses/${ts}.headers.json`, JSON.stringify(proxyRes.headers));
    // fs.writeFileSync(`./.logs/responses/${ts}.raw`, data);
    // fs.writeFileSync(`./.logs/responses/${ts}.txt`, data.toString('utf-8'));
    return proxyResData;
  },
}));

module.exports = router;
