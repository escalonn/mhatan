
var bcrypt = require('bcrypt')

var pg = require('pg');
var conString = "postgres://postgres:nmh12345@127.0.0.1/mhatan";


var dbPort = '5433';
var dbHost = '127.0.0.1';
var dbName = 'login-testing';
// use moment.js for pretty date-stamping //

 var AM = {}; 
 AM.db = new pg.Client(conString);
 AM.db.connect();
 // AM.db.on('connect',function(){
 // 	console.log('connected');
 // });
 // AM.db.on('drain',function(){
 // 	console.log('drain');
 // });
module.exports = AM;

// logging in //

// AM.autoLogin = function(user, pass, callback)
// {

// 	AM.accounts.findOne({user:user}, function(e, o) {
// 		if (o){
// 			o.pass == pass ? callback(o) : callback(null);
// 		}	else{
// 			callback(null);
// 		}
// 	});
// }

AM.manualLogin = function(email, pass, callback)
{
	var query = AM.db.query({
		text: "SELECT pen_name,password FROM users WHERE users.email = $1",
		values: [email] }
	,function(err,result){
		console.log(result);
		if(result.rowCount == 0){
			callback('user-not-found');
		}else{
			//bcrypt.compare(pass, result.rows[0].password, function(err, res) {
				if (result.rows[0].password == pass){
					console.log('right');
					callback(null, {email:email,user:result.rows[0].pen_name});
				}	else{
					callback('invalid-password');
				}
		}
	});

	// if (user== 'abc'){
	// 	callback('no lal',true);
	// }else{
	// 	callback('no user',false);
	// }
	// AM.accounts.findOne({user:user}, function(e, o) {
	// 	if (o == null){
	// 		callback('user-not-found');
	// 	}	else{
	// 		bcrypt.compare(pass, o.pass, function(err, res) {
	// 			if (res){
	// 				callback(null, o);
	// 			}	else{
	// 				callback('invalid-password');
	// 			}
	// 		});
	// 	}
	// });
}

AM.addEntry = function(text,callback)
{
	AM.db.query("SELECT MAX(entry_id) FROM entries",function(err,result){
		AM.db.query({
			text:"INSERT INTO entries VALUES($1, 1, 1, $2,'today', 'now')",
			values: [result.rows[0].max+1,text]
		},function(err,result){ 
			callback(result);
			console.log(err);});
	});
}

// record insertion, update & deletion methods //

AM.signup = function(newData, callback)
{
	var query = AM.db.query(
		{
		text: "SELECT COUNT(*) FROM users WHERE users.email = $1",
		values: [newData.email] }
	,function(err,result){
		if (result.rows[0].count != 0){
			callback('email-taken');
			console.log('email taken');
		}	else{
			AM.saltAndHash(newData.pass, function(hash){
				//newData.pass = hash;
				AM.db.query("SELECT MAX(user_id) FROM users",function(err,result){
					AM.db.query({
						text:"INSERT INTO users VALUES($1, $2, $3, $4, null,'today', null, null,null)",
						values: [result.rows[0].max+1,newData.email,newData.pass,newData.user]
						},function(err,result){ console.log(err);}
					);
				});
			});
		}
	});
}

// AM.update = function(newData, callback)
// {
// 	AM.accounts.findOne({user:newData.user}, function(e, o){
// 		o.name 		= newData.name;
// 		o.email 	= newData.email;
// 		o.country 	= newData.country;
// 		if (newData.pass == ''){
// 			AM.accounts.save(o); callback(o);
// 		}	else{
// 			AM.saltAndHash(newData.pass, function(hash){
// 				o.pass = hash;
// 				AM.accounts.save(o); callback(o);
// 			});
// 		}
// 	});
// }

// AM.setPassword = function(email, newPass, callback)
// {
// 	AM.accounts.findOne({email:email}, function(e, o){
// 		AM.saltAndHash(newPass, function(hash){
// 			o.pass = hash;
// 			AM.accounts.save(o); callback(o);
// 		});
// 	});
// }

// AM.validateLink = function(email, passHash, callback)
// {
// 	AM.accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
// 		callback(o ? 'ok' : null);
// 	});
// }

AM.saltAndHash = function(pass, callback)
{
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(pass, salt, function(err, hash) {
			callback(hash);
		});
	});
}

// AM.delete = function(id, callback)
// {
// 	AM.accounts.remove({_id: this.getObjectId(id)}, callback);
// }

// // auxiliary methods //

// AM.getEmail = function(email, callback)
// {
// 	AM.accounts.findOne({email:email}, function(e, o){ callback(o); });
// }

// AM.getObjectId = function(id)
// {
// 	return AM.accounts.db.bson_serializer.ObjectID.createFromHexString(id)
// }

AM.getAllRecords = function(callback)
{
	var query = AM.db.query( "SELECT email,pen_name,date_joined FROM users",
	function(err,result){
		callback(err,result.rows);
		});
};

AM.getAllEntries = function(callback)
{
	var query = AM.db.query( "SELECT * FROM entries",
	function(err,result){
		callback(err,result.rows);
		});
};


// AM.delAllRecords = function(id, callback)
// {
// 	AM.accounts.remove(); // reset accounts collection for testing //
// }

// // just for testing - these are not actually being used //

// AM.findById = function(id, callback)
// {
// 	AM.accounts.findOne({_id: this.getObjectId(id)},
// 		function(e, res) {
// 		if (e) callback(e)
// 		else callback(null, res)
// 	});
// };


// AM.findByMultipleFields = function(a, callback)
// {
// // this takes an array of name/val pairs to search against {fieldName : 'value'} //
// 	AM.accounts.find( { $or : a } ).toArray(
// 		function(e, results) {
// 		if (e) callback(e)
// 		else callback(null, results)
// 	});
// }
