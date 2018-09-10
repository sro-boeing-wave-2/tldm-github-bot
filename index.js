/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */

module.exports = app => {

  const signalR = require('@aspnet/signalr');
  const octokit = require('@octokit/rest');


  XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  WebSocket = require('websocket').w3cwebsocket;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://172.23.238.230:5004/chat")
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.start()
    .then(() => console.log("Connection to hub started"))
    .catch(err => console.error(err.toString()));


  // Your code here
  app.log('Yay, the app was loaded!')

  let message = "Issue assigned to ";

  app.on('issues.assigned', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    console.log(issueComment.repo)
    console.log(context.payload.assignee.login)
    message += context.payload.assignee.login;
    const user = "bot";
    const channelId = "5b9609dc52bde445e058eb8c";
    setTimeout(() => {
      connection.invoke("sendMessageInChannel", user, message, channelId)
        .then(console.log("Hub Method Invoked"))
        .catch(err => console.error(err.toString()));
    }, 3000);
    return context.github.issues.createComment(issueComment);
  })



  const user = "bot";
  const channelId = "5b9609dc52bde445e058eb8c";

  setTimeout(() => {
    connection.invoke("sendMessageInChannel", user, message, channelId)
      .then(console.log("Hub Method Invoked"))
      .catch(err => console.error(err.toString()));
  }, 3000);

  var request = require('request');

  // Set the headers
  var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
  }


  octokit.AuthOAuthSecret({
    type: 'oauth',
    key: 'Iv1.c540ce83a87ce61f',
    secret: '1f3e6d08d4788c46d516a94e7b2f7e9a09487799'
  });

  connection.on("SendMessageInChannel", (user, message) => {
    const encodedMsg = user + " says " + message;


    if (message.startsWith('/github subscribe')) {
      connection.invoke("sendMessageInChannel", "bot", "You have subscribed to notifications from " + message.slice(18) + " Click on this url to authorize tracking of your repository - https://github.com/apps/tldm-github-integration/installations/new", channelId)
        .then(console.log("Hub Method Invoked"))
        .catch(err => console.error(err.toString()));

      // Configure the request
      var options = {
        url: 'http://172.23.238.180:8888/api/repositories',
        json: { 'ChannelId':channelId, 'Username': user, 'RepositoryName': message.slice(18) }
      }
      // Start the request
      request.post(options, function (error, response, body) {
          // Print out the response body
          console.log(body)
        
      })

    }

    if (message.startsWith('/github list')) {
      octokit.authorization.check({client_id: 'Iv1.c540ce83a87ce61f', client_secret: '1f3e6d08d4788c46d516a94e7b2f7e9a09487799'})
      result = octokit.issues.addAssigneesToIssue({owner: "rishabh120296", repo: "assignment1", number: "20", assignees: "rishabh120296"})
      var context;
      context.github.issues.createComment("Hi");
      console.log(result);
      connection.invoke("sendMessageInChannel", "bot",result, channelId)
        .then(console.log("Hub Method Invoked"))
        .catch(err => console.error(err.toString()));

    }



    console.log(encodedMsg);
    if (message) {

    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
