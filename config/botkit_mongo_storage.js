var db = require('monk');
/**
 * botkit-storage-mongo - MongoDB driver for Botkit
 *
 * @param  {Object} config
 * @return {Object}
 */
module.exports = function(config) {

    if (!config || !config.mongoUri) throw new Error('Need to provide mongo address.');
	
	console.log("================== CREATE DB ==================");
    var Teams = db(config.mongoUri).get('teams'),
        Users = db(config.mongoUri).get('users'),
        Channels = db(config.mongoUri).get('channels');
	console.log("================== DB CREATED==================");
	
    var unwrapFromList = function(cb) {
		console.log("================== unwrapFromList ==================");
        return function(err, data) {
            if (err) {
				console.log('================unwrapFromList - Error ==========================');
				return cb(err);
			};
			console.log('================unwrapFromList - OK ==========================');
            cb(null, data);
        };
    };

    var storage = {
        teams: {
            get: function(id, cb) {
				console.log("================== MONGO GET Team - 1==================");
                console.log("----------------" + Teams.findOne({id: id}, cb)+ "------------------");
				console.log("================== MONGO GET Team - 2==================");
            },
            save: function(data, cb) {
				console.log("================== MONGO SAVE Team - 1==================");
                console.log("----------------" + Teams.findOneAndUpdate({id: data.id}, data, {upsert: true, new: true}, cb) + "------------------");
				console.log("================== MONGO SAVE Team - 2==================");
            },
            all: function(cb) {
				console.log("================== MONGO ALL Teams - 1 ==================");
                console.log("----------------" + Teams.find({}, cb) + "------------------");
				console.log("================== MONGO ALL Teams - 2 ==================");
            }
        },
        users: {
            get: function(id, cb) {
                Users.findOne({id: id}, unwrapFromList(cb));
            },
            save: function(data, cb) {
                Users.findAndModify({
                    id: data.id
                }, data, {
                    upsert: true,
                    new: true
                }, cb);
            },
            all: function(cb) {
                Users.find({}, cb);
            }
        },
        channels: {
            get: function(id, cb) {
                Channels.findOne({id: id}, unwrapFromList(cb));
            },
            save: function(data, cb) {
                Channels.findAndModify({
                    id: data.id
                }, data, {
                    upsert: true,
                    new: true
                }, cb);
            },
            all: function(cb) {
                Channels.find({}, cb);
            }
        }
    };

    return storage;
};