const mongoose = require('mongoose');
const { Schema } = mongoose;

const GithubBotSchema = new Schema({
    access_token: String,
    channelId: String,
    repoName: String
});

module.exports = mongoose.model('GithubBot', GithubBotSchema, 'GithubBot');