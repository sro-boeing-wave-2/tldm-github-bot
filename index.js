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
      }, { new: true }).then(response => console.log(response))
    });

    console.log(access_token);

    res.send(`Successfully Authenticated with Github.com`);
  });

  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  WebSocket = require('websocket').w3cwebsocket;

  //var chatHubUrl = "http://172.23.238.206:7001/chat-api/chat?access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImhyaXNoaXBvdGRhcjIzQGdtYWlsLmNvbSIsIlVzZXJJRCI6ImVlYWEyZTMxLWIyMTItNGJlZi04ZjgxLWE3MGQ3NDIyNTczNiJ9.JwlZpHZ3xv8hQXSyGs9SIqGFpqCBiGogfKNuItz-TvYWj9MQEZpwqSvme--y2cOTxLE124IKvSVbO_rFNRI3NIl3Y5CkjAH5iZOFuqDHLYFeKlKYsmHdC7j_PEYay_u6YQQZwSAOrsmRJhQ7Tdx7L8RPptnqrg8fZqgrGPVIkNE";
  var chatHubUrl = "http://13.233.42.222/chat-api/chat";
  //var chatApiUrl = "http://172.23.238.206:7001/chat-api/api/chat/workspaces/workspacename/";
  var chatApiUrl = "http://13.233.42.222/chat-api/api/chat/workspaces/workspacename/"

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(chatHubUrl)
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.start()
    .then(() => {
      console.log("Connection to hub started");
      connection.invoke("sendToAllconnid", "tldm.github.bot@gmail.com")
        .then(console.log("BOT IS NOW ONLINE!"))
        .catch(err => console.error(err.toString()))
      connection.invoke("sendAllUserChannel", "tldm.github.bot@gmail.com")
        .then(console.log("Requested for the list of channels where bot is installed"))
        .catch(err => console.error(err.toString()));
    })
    .catch(err => console.error(err.toString()));


  // Your code here
  app.log('Yay, the app was loaded!');

  connection.on("ReceiveUserChannels", (listofUserChannels, emailId) => {

    if (emailId == "tldm.github.bot@gmail.com") {
      console.log(listofUserChannels);

      listofUserChannels.forEach(channelId => {
        connection.invoke('joinChannel', channelId)
          .catch(err => console.log(err));
      });
    }



  });



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
      axios.get(chatApiUrl + channelId)
        .then(response => {
          console.log("Getting workspace name");
          workspacename = response.data;
          console.log(workspacename);
          connection.invoke("sendMessageInChannel", "entre.bot@gmail.com", message, channelId, workspacename)
            .then(console.log("Hub Method Invoked"))
            .catch(err => console.error(err.toString()));
        })
        .catch(error => {
          console.log(error);
        });

      return context.github.issues.createComment(issueComment);
    })
  });

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    console.log(issueComment.repo)
    assignedBy = context.payload.issue.user.login;
    issue = context.payload.issue.title;
    const user = "bot";
    var repoName = context.payload.repository.full_name;
    var response = GithubBotModel.find({ repoName: repoName }).then(map => {
      console.log(map);
      var channelId = map[0].channelId;
      var message = {
        messageBody: "Issue " + issue + " opened by " + assignedBy + " in repository " + repoName,
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
      axios.get(chatApiUrl + channelId)
        .then(response => {
          console.log("Getting workspace name");
          workspacename = response.data;
          console.log(workspacename);
          connection.invoke("sendMessageInChannel", "tldm.github.bot@gmail.com", message, channelId, workspacename)
            .then(console.log("Hub Method Invoked"))
            .catch(err => console.error(err.toString()));
        })
        .catch(error => {
          console.log(error);
        });

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

      GithubBotModel.find({}).then(map => {
        console.log("Looking for entries in DB");
        console.log(map);
        flag = 0;
        if (map.length != 0) {
          console.log("Found something in DB!!!");
          map.forEach(obj => {
            if (obj.repoName == message.messageBody.slice(18)) {
              var message1 = {
                messageBody: "Someone has already subscribed to this repository!!!",
                timestamp: new Date().toISOString(),
                isStarred: true,
                channelId: channelId,
                sender: {
                  id: "101010101010101010101010",
                  emailId: "tldm.github.bot@gmail.com",
                  firstName: "Github",
                  lastName: "User",
                  userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
                }
              }
              flag = 1;

              axios.get(chatApiUrl + channelId)
                .then(response => {
                  console.log("Getting workspace name");
                  workspacename = response.data;
                  console.log(workspacename);
                  connection.invoke("sendMessageInChannel", "tldm.github.bot@gmail.com", message1, channelId, workspacename)
                    .then(console.log("Hub Method Invoked"))
                    .catch(err => console.error(err.toString()));
                })
                .catch(error => {
                  console.log(error);
                });

            }

          })
        }
        if (map.length == 0 || flag == 0) {

          console.log(message);

          const githubTLDMMapping = new GithubBotModel({
            repoName: message.messageBody.slice(18),
            channelId: channelId,
            access_token: null
          });
          const createdMapping = githubTLDMMapping.save();
          console.log(createdMapping);

          var message2 = {
            messageBody: "You have subscribed to notifications from " + message.messageBody.slice(18) + " Click below to install the bot in your repository -<button><a href= 'https://github.com/apps/tldm-github-integration/installations/new' target='_blank'>Connect</a></button>",
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

          axios.get(chatApiUrl + channelId)
            .then(response => {
              console.log("Getting workspace name");
              workspacename = response.data;
              console.log(workspacename);
              connection.invoke("sendMessageInChannel", "tldm.github.bot@gmail.com", message2, channelId, workspacename)
                .then(console.log("Hub Method Invoked"))
                .catch(err => console.error(err.toString()));
            })
            .catch(error => {
              console.log(error);
            });

        }
      });
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
              firstName: "Github",
              lastName: "Bot",
              userId: "60681125-e117-4bb2-9287-eb840c4cf67e"
            }
          }
          axios.get(chatApiUrl + channelId)
            .then(response => {
              console.log("Getting workspace name");
              workspacename = response.data;
              console.log(workspacename);
              connection.invoke("sendMessageInChannel", "entre.bot@gmail.com", message, channelId, workspacename)
                .then(console.log("Hub Method Invoked"))
                .catch(err => console.error(err.toString()));
            })
            .catch(error => {
              console.log(error);
            });

        }

      });

    }

    if (message.messageBody.startsWith("/github unsubscribe")) {

      GithubBotModel.find({ channelId: message.channelId }).then(searchByChannelId => {
        console.log("This is to be deleted! " + searchByChannelId[0]);
        GithubBotModel.findByIdAndRemove(searchByChannelId[0]._id).then(response => console.log(response));
      });

      var message = {
        messageBody: "Repository unsubscribed",
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
      axios.get(chatApiUrl + channelId)
        .then(response => {
          console.log("Getting workspace name");
          workspacename = response.data;
          console.log(workspacename);
          connection.invoke("sendMessageInChannel", "entre.bot@gmail.com", message, channelId, workspacename)
            .then(console.log("Hub Method Invoked"))
            .catch(err => console.error(err.toString()));
        })
        .catch(error => {
          console.log(error);
        });

    }

    if (message.messageBody.startsWith("/github help")) {

      var message = {
        messageBody: "Need some help with /github ? <br> 1. Subscribe to notifications for a repository: /github subscribe owner/repository <br> 2. Unsubscribe to notifications for a repository: /github unsubscribe <br> 3. Add assigneed to an issue: /github addAssigneeToIssue owner repository issueNumber assigne",
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
      axios.get(chatApiUrl + message.channelId)
        .then(response => {
          console.log("Getting workspace name");
          workspacename = response.data;
          console.log(workspacename);
          connection.invoke("sendMessageInChannel", "tldm.github.bot@gmail.com", message, channelId, workspacename)
            .then(console.log("Hub Method Invoked"))
            .catch(err => console.error(err.toString()));
        })
        .catch(error => {
          console.log(error);
        });

    }
  });

}