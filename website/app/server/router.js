
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

module.exports = function(app) {

	app.get('/home', function(req, res) {
	//     if (req.session.user == null){
	// // if user is not logged-in redirect back to login page //
	//         res.redirect('/');
	//     }   else{
		AM.getAllEntries(function(e,udata){
			res.render('entry', {
				locals: {
					title : 'Entry',
					entries : udata
				}
			});
		});
	});

	app.post('/home', function(req, res){
		if (req.param('entry_text') != undefined) {
			AM.addEntry(req.param('entry_text'), function(o){
				if (o){
					res.redirect('/home');
				}	else{
					res.send('error-creating-post', 400);
				}
			});
		}
	});


// main login page //
	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.email == undefined || req.cookies.pass == undefined){
			res.render('login', { locals: { title: 'Hello' }});
		}	else{
	// attempt automatic login //
			AM.manualLogin(req.cookies.email, req.cookies.pass, function(e,o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/account');
				}	else{
					res.render('login', { locals: { title: 'Hello' }});
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('email'), req.param('pass'), function(e,o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('email', o.email, { maxAge: 900000 });
					res.cookie('pass', req.param('pass'), { maxAge: 900000 });
				}
				res.send(o, 200);
				//console.log('no user');
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/account', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('home', {
				locals: {
					title : 'Control Panel',
					udata : req.session.user
				}
			});
	    }
	});
	
	app.post('/account', function(req, res){
		if (req.param('user') != undefined) {
			AM.update({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(o){
				if (o){
					req.session.user = o;
			// udpate the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}	else{
					res.send('error-updating-account', 400);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('email');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  locals: { title: 'Signup' }});
	});
	
	app.post('/signup', function(req, res){
		AM.signup({
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
		}, function(e, o){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	// app.post('/lost-password', function(req, res){
	// // look up the user's account via their email //
	// 	AM.getEmail(req.param('email'), function(o){
	// 		if (o){
	// 			res.send('ok', 200);
	// 			EM.dispatchResetPasswordLink(o, function(e, m){
	// 			// this callback takes a moment to return //
	// 			// should add an ajax loader to give user feedback //
	// 				if (!e) {
	// 				//	res.send('ok', 200);
	// 				}	else{
	// 					res.send('email-server-error', 400);
	// 					for (k in e) console.log('error : ', k, e[k]);
	// 				}
	// 			});
	// 		}	else{
	// 			res.send('email-not-found', 400);
	// 		}
	// 	});
	// });

	// app.get('/reset-password', function(req, res) {
	// 	var email = req.query["e"];
	// 	var passH = req.query["p"];
	// 	AM.validateLink(email, passH, function(e){
	// 		if (e != 'ok'){
	// 			res.redirect('/');
	// 		} else{
	// // save the user's email in a session instead of sending to the client //
	// 			req.session.reset = { email:email, passHash:passH };
	// 			res.render('reset', { title : 'Reset Password' });
	// 		}
	// 	})
	// });
	
	// app.post('/reset-password', function(req, res) {
	// 	var nPass = req.param('pass');
	// // retrieve the user's email from the session to lookup their account and reset password //
	// 	var email = req.session.reset.email;
	// // destory the session immediately after retrieving the stored email //
	// 	req.session.destroy();
	// 	AM.setPassword(email, nPass, function(o){
	// 		if (o){
	// 			res.send('ok', 200);
	// 		}	else{
	// 			res.send('unable to update password', 400);
	// 		}
	// 	})
	// });
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
	
	// app.post('/delete', function(req, res){
	// 	AM.delete(req.body.id, function(e, obj){
	// 		if (!e){
	// 			res.clearCookie('user');
	// 			res.clearCookie('pass');
	//             req.session.destroy(function(e){ res.send('ok', 200); });
	// 		}	else{
	// 			res.send('record not found', 400);
	// 		}
	//     });
	// });
	
	// app.get('/reset', function(req, res) {
	// 	AM.delAllRecords( );
	// 	res.redirect('/print');
	// });
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};