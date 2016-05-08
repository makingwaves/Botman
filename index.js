'use strict';

// Quickstart example
// See https://wit.ai/l5t/Quickstart

// When not cloning the `node-wit` repo, replace the `require` like so:
// const Wit = require('node-wit').Wit;
const Wit = require('node-wit').Wit;
const yrf = require('yr.no-forecast');
const log4js = require('log4js');
const log = log4js.getLogger('botman');
const readline = require('readline');



const getPostNummerDict = () => {
    return new Promise(function(resolve, reject) {
        let postDict = {};
        if (Object.keys(postDict).length === 0) {
            log.debug('fetching postnummers');
            var lineReader = readline.createInterface({
                input: require('fs').createReadStream('postnummer.csv')
            });
            lineReader.on('line', function(line) {
              
                var items = line.split('\t');
                var place = items[1].toLowerCase();
                var newpost = { 'lat': items[9], 'lon': items[10] }
                postDict[place] = newpost;
            });
            lineReader.on('close', function(){
              log.debug('fetched postnummers', Object.keys(postDict).length);
              log.debug('halden er ', postDict['halden'])
              resolve(postDict);
            })
            /*lineReader.on('error', function(err){
              lineReader.close();
              log.error('error reading postnummer file', err);
              reject('ERROR!')
            })
            */
            
        }
        
    });
}


const forecast = (location, outercb) => {
    location = location.toLowerCase();
    var geoloc = postDict[location];
    if (!geoloc) {
        return outercb("fant ikke stedsinformasjon for sted " + location);
    }
    log.debug('wehei, checking out', location,  geoloc);
    return yrf.getWeather(geoloc, function(err, result) {
        if (!err) {
            return outercb(null, result);
        } else {
            return outercb(err);

        }
    })
};

const token = (() => {
    if (process.argv.length !== 3) {
        log.debug('usage: node examples/weather.js <wit-token>');
        process.exit(1);
    }
    return process.argv[2];
})();

const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};

const actions = {
    say: (sessionId, context, message, cb) => {
        log.debug(message);
        cb();
    },
    merge: (sessionId, context, entities, message, cb) => {
        // Retrieve the location entity and store it into a context field
        const loc = firstEntityValue(entities, 'location');
        if (loc) {
            context.loc = loc;
        }
        cb(context);
    },
    error: (sessionId, context, error) => {
        log.debug(error.message);
    },
    'getWeather': (sessionId, context, cb) => {
        if (!context.loc) {
            return cb();
        }
        forecast(context.loc, function(err, location) {
            if (!err) {

                location.getCurrentSummary(function(err, result) {
                  log.debug('temp', result.temperature);
                    context.forecast = result.temperature;
                    context = "temparatur " + result.temperature;
                    cb()
                });
                //cb(context);
                return;
            }
            else {
                cb(err);
            }
            
        });

    },
};
var postDict =  {};
getPostNummerDict().then(function(result) {
    postDict = result;
});
const client = new Wit(token, actions);
client.interactive();
