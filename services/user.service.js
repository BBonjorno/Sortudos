var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });

db.bind('users');
db.bind('bets');

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.saveBet = saveBet;
service.getBets = getBets;

module.exports = service;

function authenticate(email, password) {
    var deferred = Q.defer();

    db.users.findOne({ email: email }, function (err, user) {
        if (err) {
            deferred.reject(err);
        }
        
        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.users.findById(_id, function (err, user) {
        if (err) {
            deferred.reject(err);
        }

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne(
        { email: userParam.email },
        function (err, user) {
            if (err) {
                deferred.reject(err);
            }
            
            if (user) {
                // username already exists
                deferred.reject('E-mail "' + userParam.email + '" já foi registrado');
            } else {
                createUser();
            }
        });

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.users.insert(
            user,
            function (err, doc) {
                if (err) {
                    deferred.reject(err);
                }
                
                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findById(_id, function (err, user) {
        if (err) {
            deferred.reject(err);
        }
        
        if (user.email !== userParam.email) {
            db.users.findOne(
                { email: userParam.email },
                function (err, user) {
                    if (err) {
                        deferred.reject(err);
                    }
                    
                    if (user) {
                        // email already exists
                        deferred.reject('E-mail "' + user.email + '" já existe')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            name: userParam.name,
            email: userParam.email
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) {
                    deferred.reject(err);
            }
            
                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) {
                deferred.reject(err);
            }
            
            deferred.resolve();
        });

    return deferred.promise;
}



function saveBet(_id,betParam) {
    var deferred = Q.defer();


    db.bets.insert(
        {
            bet: betParam,
            user: _id
        },
        function (err, bet) {
            if (err) {
                deferred.reject(err);
            }
            
            deferred.resolve();
        });

    return deferred.promise;
}


function getBets(_id) {
    var deferred = Q.defer();

    db.bets.find().toArray(function(err, bets) {
        if (err) {
            deferred.reject(err);
        }
        //console.log(bets);
        
        if (bets) {
        // return user (without hashed password)
            deferred.resolve(bets);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}
