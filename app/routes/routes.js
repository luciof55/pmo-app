var Request          = require('request')
var slack           = require('../controllers/botkit')

// frontend routes =========================================================
module.exports = function(app) {

  //public pages=============================================
  //create
  app.get('/create', function(req, res) {
    console.log("root")

    res.render('root'); // load view/root.html file
  });

  //public test
  //test
  app.get('/test', function(req, res) {
    console.log("test")

	 var teamTest = {
            id: 1,
            bot:{
              token: 'token',
              user_id: 1,
              createdBy: 1
            },
            createdBy: 1,
            url: 'url',
            name: 'team'
          };
		  
	insertTeam(teamTest);
	res.send("Team has been saved");
  });
  
  //new user creation - redirection from Slack
  app.get('/aouth', function(req, res) {
    console.log("================== START TEAM REGISTRATION ==================")
    //temporary authorization code
    var auth_code = req.query.code

    if(!auth_code){
      //user refused auth
      res.redirect('/create')
    }
    else{
      console.log("New user auth code " + auth_code)
      perform_auth(auth_code, res)
    }
  })

  //CREATION ===================================================

  var perform_auth = function(auth_code, res){
    //post code, app ID, and app secret, to get token
    var auth_adresse = 'https://slack.com/api/oauth.access?'
    auth_adresse += 'client_id=' + process.env.clientId
    auth_adresse += '&client_secret=' + process.env.clientSecret
    auth_adresse += '&code=' + auth_code
    auth_adresse += '&redirect_uri=' + process.env.slackRedirect + "aouth"

    Request.get(auth_adresse, function (error, response, body) {
      if (error){
        console.log(error)
        res.sendStatus(500)
      }

      else{
        var auth = JSON.parse(body)
        console.log("New user auth")
        console.log(auth)

        register_team(auth,res)
      }
    })
  }

  var register_team = function(auth, res){
    //first, get authenticating user ID
    var url = 'https://slack.com/api/auth.test?'
    url += 'token=' + auth.access_token

    Request.get(url, function (error, response, body) {
      if (error){
        console.log(error)
        res.sendStatus(500)
      }
      else{
        try{
          var identity = JSON.parse(body)
          console.log(identity)

          var team = {
            id: identity.team_id,
            bot:{
              token: auth.bot.bot_access_token,
              user_id: auth.bot.bot_user_id,
              createdBy: identity.user_id
            },
            createdBy: identity.user_id,
            url: identity.url,
            name: identity.team
          }
         
		  saveUser(auth, identity);
		  saveTeam(team);
		  startBot(team);
          res.send("Your bot has been installed");
         
        }
        catch(e){
          console.log(e)
        }
      }
    })
  }

  var startBot = function(team){
    console.log(team.name + " create and start bot")

    slack.create(team);
  }

  var saveUser = function(auth, identity){
    console.log("================== START USER REGISTRATION ==================");
    // what scopes did we get approved for?
    var scopes = auth.scope.split(/\,/);

    slack.controller.storage.users.get(identity.user_id, function(err, user) {
      isnew = false;
      if (!user) {
		console.log("================== USER NOT FOUND ==================");
          isnew = true;
          user = {
              id: identity.user_id,
              access_token: auth.access_token,
              scopes: scopes,
              team_id: identity.team_id,
              user: identity.user,
          };
      }
      slack.controller.storage.users.save(user, function(err, id) {
        if (err) {
          console.log('An error occurred while saving a user: ', err);
          slack.controller.trigger('error', [err]);
        }
        else {
          if (isnew) {
            console.log("New user " + id.toString() + " saved");
          }
          else {
            console.log("User " + id.toString() + " updated");
          }
          console.log("================== END USER REGISTRATION ==================");
        }
      });
    });
  }

var saveTeam = function(team){
    console.log("================== START TEAM REGISTRATION ==================");
	
	slack.controller.storage.teams.get(team.id, function(err, team) {
		console.log("================== CALLBACK GET EXECUTE START ==================");
		if (err) {
			console.log('An error occurred while getting a team: ', err);
			slack.controller.trigger('error', [err]);
		} else {
			isnew = false;
			if (!team) {
				console.log("================== TEAM NOT FOUND ==================");
				isnew = true;
			} else {
				console.log("================== TEAM FOUND ==================");
			};
			insertTeam(team);
			console.log("================== END TEAM REGISTRATION ==================");
		};
    });
  };
  
var insertTeam = function(team) {
	slack.controller.storage.teams.save(team, function(err, id) {
		console.log("================== CALLBACK insertTeam EXECUTE START ==================");
		if (err) {
			console.log('An error occurred while inserting the team: ', err);
			slack.controller.trigger('error', [err]);
		} else {
			console.log("New team " + id.toString() + " saved");
		};
		console.log("================== CALLBACK insertTeam EXECUTE END ==================");
	});
  }; 
  
  
}