module.exports = app => {
  const signalR = require('@aspnet/signalr');
  const octokit = require('@octokit/rest')();
  const config = require('./app.config');
  const axios = require('axios');
  const mongoose = require('mongoose');
  const GithubBotModel = require('./github.schema');

  mongoose.connect(config.MONGODB_URL);

  const router = app.route('/github');

  router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    console.log(code, state);
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      "client_id": "Iv1.c540ce83a87ce61f",
      "client_secret": "1f3e6d08d4788c46d516a94e7b2f7e9a09487799",
      code,
      state,
    });
    const access_token = response.data.split('&')[0].split('=')[1];
    GithubBotModel.find({ channelId: state }).then(searchByChannelId => {
      console.log("This is search result token " + searchByChannelId[0]);
      GithubBotModel.findByIdAndUpdate(searchByChannelId[0]._id, {
        access_token: access_token,
        channelId: searchByChannelId[0].channelId,
        repoName: searchByChannelId[0].repoName
      }, { new: true }).then(reponse => console.log(response))
    });

    console.log(access_token);

    res.send(`Successfully Authenticated with Github.com`);
  });

  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  WebSocket = require('websocket').w3cwebsocket;




  const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:80/connect/chat?access_token=\"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6InRsZG0uZ2l0aHViLmJvdEBnbWFpbC5jb20ifQ.SzqZUQ_KLubRfbTkyEjypBUShrzaza58jHTHVx1hxsZunW2JenEZsqo2M6zMTeFxxaBelSXM4jVKp7iGjFtKpmFYbCoOJIXTqVQClar2lar8Rr8fmLPmlHyhSN9ClRv82D90vx_VvovZoXSOUVPv-J3sukiW6xvl7RJfRrOYIgE\"")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.start()
    .then(() => {
      console.log("Connection to hub started");
      connection.invoke("sendToAllconnid", "tldm.github.bot@gmail.com")
        .then(console.log("BOT IS NOW ONLINE!"))
        .catch(err => console.error(err.toString()));

      axios.get('http://localhost:80/connect/api/chat/workspaces/userchannels/tldm.github.bot@gmail.com?access_token=\"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6InRsZG0uZ2l0aHViLmJvdEBnbWFpbC5jb20ifQ.SzqZUQ_KLubRfbTkyEjypBUShrzaza58jHTHVx1hxsZunW2JenEZsqo2M6zMTeFxxaBelSXM4jVKp7iGjFtKpmFYbCoOJIXTqVQClar2lar8Rr8fmLPmlHyhSN9ClRv82D90vx_VvovZoXSOUVPv-J3sukiW6xvl7RJfRrOYIgE\"', querystring.stringify({ access_token: 'bar' }))
        .then(function (response) {
          // handle success
          console.log(response.data);
          response.data.forEach(channelId => {
            connection.invoke('joinChannel', channelId)
              .catch(err => console.log(err));
          });
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          // always executed
        });

    })
    .catch(err => console.error(err.toString()));


  // Your code here
  app.log('Yay, the app was loaded!')



  app.on('issues.assigned', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    console.log(issueComment.repo)
    console.log(context.payload.assignee.login)
    assignee = context.payload.assignee.login;
    issue = context.payload.issue.title;
    const user = "bot";
    var repoName = context.payload.repository.full_name;

    var response = GithubBotModel.find({ repoName: repoName }).then(map => {
      console.log(map);
      var channelId = map[0].channelId;
      var message = {
        messageBody: "Issue " + issue + "assigned to " + assignee,
        timestamp: new Date().toISOString(),
        isStarred: true,
        channelId: channelId,
        sender: {
          id: "101010101010101010101010",
          emailId: "tldm.github.bot@gmail.com",
          firstName: "Github",
          lastName: "Bot",
          userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
        }
      }
      connection.invoke("sendMessageInChannel", "bot", message, channelId)
        .then(console.log("Hub Method Invoked"))
        .catch(err => console.error(err.toString()));
      return context.github.issues.createComment(issueComment);
    })
  });

  connection.on("SendToAllconnid", (activeusers) => {
  });

  connection.on("JoinChannel", (channelId) => {
  });


  connection.on("SendMessageInChannel", (user, message) => {
    channelId = message.channelId;

    if (message.messageBody.startsWith('/github subscribe')) {

      console.log(message);

      const githubTLDMMapping = new GithubBotModel({
        repoName: message.messageBody.slice(18),
        channelId: channelId,
        access_token: null
      });
      const createdMapping = githubTLDMMapping.save();
      console.log(createdMapping);

      var message = {
        messageBody: "You have subscribed to notifications from " + message.messageBody.slice(18) + " Click on this url to intall the bot in your repository -<a>https://github.com/apps/tldm-github-integration/installations/new</a>",
        timestamp: new Date().toISOString(),
        isStarred: true,
        channelId: channelId,
        sender: {
          id: "101010101010101010101010",
          emailId: "tldm.github.bot@gmail.com",
          firstName: "Bot",
          lastName: "User",
          userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
        }
      }

      connection.invoke("sendMessageInChannel", "bot", message, channelId)
        .then(console.log("Hub Method Invoked"))
        .catch(err => console.error(err.toString()));

    }

    if (message.messageBody.startsWith('/github addAssigneeToIssue')) {
      console.log(message);
      var message1 = message;
      GithubBotModel.find({ channelId: channelId }).then(map => {
        if (map[0].access_token != null) {
          octokit.authenticate({
            type: 'token',
            token: map[0].access_token
          });
          console.log(message1);
          var splitmessage = message1.messageBody.split(" ");
          owner = splitmessage[2];
          repo = splitmessage[3];
          number = splitmessage[4];
          assignees = splitmessage[5];
          octokit.issues.addAssigneesToIssue({ owner: owner, repo: repo, number: number, assignees: assignees })
          var message = {
            messageBody: "Issue Assigned",
            timestamp: new Date().toISOString(),
            isStarred: true,
            channelId: channelId,
            sender: {
              id: "101010101010101010101010",
              emailId: "tldm.github.bot@gmail.com",
              firstName: "Bot",
              lastName: "User",
              userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
            }
          }
          connection.invoke("sendMessageInChannel", "bot", message, channelId)
            .then(console.log("Hub Method Invoked"))
            .catch(err => console.error(err.toString()));
        }

        else {
          var message = {
            messageBody: "You have not authenticated your github account. Click on this url to authorize tracking of your repository - https://github.com/login/oauth/authorize/?client_id=Iv1.c540ce83a87ce61f&state=" + channelId + " and try again.",
            timestamp: new Date().toISOString(),
            isStarred: true,
            channelId: channelId,
            sender: {
              id: "101010101010101010101010",
              emailId: "tldm.github.bot@gmail.com",
              firstName: "Bot",
              lastName: "User",
              userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
            }
          }
          connection.invoke("sendMessageInChannel", "bot", message, channelId)
            .then(console.log("Hub Method Invoked"))
            .catch(err => console.error(err.toString()));
        }

      });

    }
  });

}