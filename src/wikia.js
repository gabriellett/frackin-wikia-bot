const request = require('superagent');
const _ = require('lodash');
const Promise = require('bluebird')

// Auxiliary functions
const esc = encodeURIComponent;
const query = (params) => Object.keys(params).map(k => esc(k) + '=' + esc(params[k])).join('&');

// Wikia force us to login and have a session, so we must use the same agent forever :cry:
const agent = request.agent()

const loginRequest = (username, password, token, cookiePrefix, sessionId) => {
  const params = {
    'action' : 'login',
    'lgname' : username,
    'lgpassword' : password,
    'lgtoken' : token ? token : '',
    'cookieprefix' : cookiePrefix ? cookiePrefix : '',
    'sessionid' : sessionId ? sessionId : '',
    'format': 'json'
  };

  return agent.post(`http://frackinuniversestaging.wikia.com/api.php?${query(params)}`)
       .then((response) => response.body)
}

// Login flow
const login = (username, password, callbacks) =>
  loginRequest(username, password)
  .then((body) => loginRequest(username, password, body.login.token, body.login.cookieprefix))
  .then(logJson)
  .then((response) => {
    callbacks.forEach((c) => c(agent, response))
  }).catch((e) => console.error(e));

// Edit a page
const editPage = (page, article) => (agent, response) => {
// Need to implement this: Get the content before and only replace on certain
// BOT tags, can be done using HTML comments or something like that.
//	getOriginalPage(page)(agent)
//		.then((originalText) => {
//  });
  getEditToken(page)(agent)
    .then(logJson)
    .then((token) => {
      // We need to split the text because the API won't work with body parameters
      texts = [
        {text: ''},
        ...splitText(article.text, 2000).map((text) => ({appendtext: text}))
      ];

      return Promise.each(texts, (text) => postEdit(token, article, text));

    });
};


// Textobj will be appended to the params.
// Need to be like this so we can append or change the entire text of the page
const postEdit = (token, article, textObj) => {
  const params = query(_.merge({
    token,
    action: 'edit',
    title: article.title,
    bot: true,
    format: 'json'
  }, textObj));


  return new Promise(function(resolve, reject) {
    return agent.post(`http://frackinuniversestaging.wikia.com/api.php?${params}`)
    .then((resp) => resp.body)
    .then(logJson)
    .then((json) => resolve(json))
    .then(resolve)
    .catch(reject)
  })
};

// Gets the raw content of the page. Might be usefull for only replacing
// certain content of the page.
const getOriginalPage = (pageTitle) => (agent) => {
  return agent.get(`http://frackinuniversestaging.wikia.com/wiki/${esc(pageTitle)}?action=raw`)
		.then((resp) => resp.body)
		.catch((e) => { console.log("Got error", e); return '' })
}

// Fetches the edit token for a given page. Will only work if the search
// for pages return ONE page, dunno if it's possible to return more than
// one page.
const getEditToken = (pageTitle) => (agent) => {
  const params = {
    action: 'query',
    prop: 'info',
    titles: pageTitle,
    intoken: 'edit',
    format: 'json'
  };

  return agent.get(`http://frackinuniversestaging.wikia.com/api.php?${query(params)}`)
              .catch((e) => console.error(e))
              .then((resp) => resp.body )
              .then((body) => body.query.pages)
              .then(getOnlyPage)
              .then(logJson)
              .then((page) => page.edittoken)
};

// Helper functions:

// Logs a JSON and return the same json, useful on promises
const logJson = (jsonText) => {
  console.log(JSON.stringify(jsonText));
  return jsonText;
}

// Make sure there is only one page on the tokens request
const getOnlyPage = (pages) => {
  const length = Object.keys(pages).length;
  if (length !== 1){
    throw `Got wrong number of pages! Expecting 1, got ${length}`;
  }
  return pages[Object.keys(pages)[0]];
}

// Split a big text into small pieces.
const splitText = (str, len) => {
  var ret = [ ];
  for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
    ret.push(str.substr(offset, len));
  }
  return ret;
}

module.exports = {
  login,
  editPage
};
