'use strict';

const yrf = require('yr.no-forecast');
const readline = require('readline');

const log4js = require('log4js');
const log = log4js.getLogger('yr-forecast');
var postDict = {};

var getPostNummerDict = () => {
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
              resolve(postDict);
            })
        }
        
    });
}


const forecast = (location) => {
    return new Promise(function(resolve, reject) {
        location = location.toLowerCase();
        var geoloc = postDict[location];
        if (!geoloc) {
            return reject("fant ikke stedsinformasjon for sted " + location);
        }
        log.debug('wehei, checking out', location,  geoloc);
        yrf.getWeather(geoloc, function(err, result) {
            if (err) {
                return reject(err);
            }
            result.getCurrentSummary(function(err, result) {
           		if(err){
           			return reject(err);
           		}
                resolve(result);
            });
        }    );
});

}

const init = () => {
	getPostNummerDict().then(function(data){
		log.debug('got postnummerdata');
		postDict = data;
	}, function(err){
		log.error('failed miserably getting postnummerdata', err);
	})
}

exports.forecast = forecast;
exports.init = init;