'use strict'

var Store = require('./store_model');

//calculates distance between two lng/lat pairs
function calcDistance(lat1, lng1, lat2, lng2, unit) {
    var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lng1-lng2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist;
}

//leveages calcDistance function to find nearestStore
function nearestStore(storeData, targetLat, targetLng) {
    var minDistance;
    var nearestStoreData;

    //calc min distance by comparing target lng and lat to every store in same state
    //NOTE: there could be a few edge cases where the nearest store is actually in a different state, but think this should
    //suffice for v1
    for(var i = 0; i < storeData.length; i++) {
        var currStore = storeData[i];
        var currStoreLat = currStore.lat;
        var currStoreLng = currStore.lng;
        var currDistance = calcDistance(targetLat, targetLng, currStoreLat, currStoreLng);

        if(!minDistance || currDistance < minDistance) {
            minDistance = currDistance;
            nearestStoreData = currStore;
        }
    }

    return nearestStoreData;
}

module.exports = {
    findNearestStore: function(req, res, cb) {
        //parse data from req.body
        var targetLat = req.body.lat;
        var targetLng = req.body.lng;
        var targetCity = req.body.city;
        var targetState = req.body.state;

        //find all stores in the same state, to limit nearestStore calculation
        Store.find({ 'State': targetState }, function(err, data){
            if(err) {
                console.log("Problem querying db: ", err);
            } else {
                console.log("successfully retrieved data from db")
                //clean up data returned from db query               
                var storeData = data.map(function(completeStoreInfo) {
                    var storeInfo = {};
                    var cleanedUpStoreZip = completeStoreInfo["Zip Code"].slice(0,5);
                    
                    storeInfo.name = completeStoreInfo['Store Name'];
                    storeInfo.address = completeStoreInfo.Address + ", " +
                                        completeStoreInfo.City + ", " + 
                                        completeStoreInfo.State + ", " +
                                        cleanedUpStoreZip; 
                                   
                    storeInfo.lat = completeStoreInfo.Latitude;
                    storeInfo.lng = completeStoreInfo.Longitude;
                    
                    return storeInfo;
                });
                
                //determine nearest store
                var nearestStoreInfo = nearestStore(storeData, targetLat, targetLng);
                //return nearest store
                res.send(nearestStoreInfo);
                //for testing purposes
                cb();
            }
        })
    }
}