module.exports = app => {
  const signalR = require('@aspnet/signalr');
  const octokit = require('@octokit/rest')();
  const config = require('./app.config');
  const axios = require('axios');
  const mongoose = require('mongoose');
  const GithubBotModel = require('./github.schema');

  mongoose.connect(config.MONGODB_URL);

  const router = app.route('/github');

  const channelId = "5ba0f61fe3eaea16ecef82ff";


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
    .withUrl("http://172.23.238.230:5004/chat")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.start()
    .then(() => {
      console.log("Connection to hub started");
      connection.invoke("sendToAllconnid", "tldm-github-bot@gmail.com")
        .then(console.log("BOT IS NOW ONLINE!"))
        .catch(err => console.error(err.toString()));

      var message = {
        messageId: "",
        messageBody: "BOT ACTIVATED!",
        timestamp: new Date().toISOString(),
        isStarred: true,
        sender: {
          id: "101010101010101010101010",
          emailId: "tldm-github-bot@gmail.com",
          firstName: "Bot",
          lastName: "User",
          userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
        }
      };
      console.log(message);
      const user = "bot";
      connection.invoke("sendMessageInChannel", user, message, channelId)
        .then(console.log("Hub Method Invoked"))
        .catch(err => console.error(err.toString()));

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
    var message = {
      messageBody: "Issue " + issue + "assigned to " + assignee,
      timestamp: new Date().toISOString(),
      isStarred: true,
      sender: {
        id: "101010101010101010101010",
        emailId: "tldm-github-bot@gmail.com",
        firstName: "Bot",
        lastName: "User",
        userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
      }
    }
    var response = GithubBotModel.find({ repoName: repoName }).then(map => {
      console.log(map);
      var channelId = map[0].channelId;
      connection.invoke("sendMessageInChannel", "bot", message, channelId)
        .then(console.log("Hub Method Invoked"))
        .catch(err => console.error(err.toString()));
      return context.github.issues.createComment(issueComment);
    })
  });

  connection.on("SendToAllconnid", (activeusers) => {
  });


  connection.on("SendMessageInChannel", (user, message) => {

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
        messageBody: "You have subscribed to notifications from " + message.messageBody.slice(18) + "Click on this url to intall the bot in your repository - https://github.com/apps/tldm-github-integration/installations/new",
        timestamp: new Date().toISOString(),
        isStarred: true,
        sender: {
          id: "101010101010101010101010",
          emailId: "tldm-github-bot@gmail.com",
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
            sender: {
              id: "101010101010101010101010",
              emailId: "tldm-github-bot@gmail.com",
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
            sender: {
              id: "101010101010101010101010",
              emailId: "tldm-github-bot@gmail.com",
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