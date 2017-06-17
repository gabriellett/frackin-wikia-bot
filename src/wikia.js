const request = require('superagent');
const _ = require('lodash');
const Promise = require('bluebird')

// Auxiliary functions
const esc = encodeURIComponent;
const query = (params) => Object.keys(params).map(k => esc(k) + '=' + esc(params[k])).join('&');

const loginRequest = (agent, username, password, token, cookiePrefix, sessionId) => {
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
        .catch((e) => console.error(e))
}

// Login flow
const login = (username, password, callbacks) => {

  // Wikia force us to login and have a session, so we must use the same agent forever :cry:
  const agent = request.agent()

  return loginRequest(agent, username, password)
  .then((body) => loginRequest(agent, username, password, body.login.token, body.login.cookieprefix))
  .then(logJson)
  .then((response) => {
    callbacks.forEach((c) => c(agent, response))

    // Someone may use the agent again
    return agent;
  }).catch((e) => console.error(e));
};

const fetchImagesGivenAgent = (agent) => {
  params = {
    action: 'query',
    list: 'allimages',
    aiprop: 'sha1',
    ailimit: 5000,
    format: 'json'
  }

  return agent.get(`http://frackinuniversestaging.wikia.com/api.php?${query(params)}`)
    .then((resp) => resp.body)
    .then((body) => body.query.allimages)
    .then((images) => images.reduce((acc, cur, i) => {
      acc[cur.sha1] = cur;
      return acc;
    }, {}))
    .then((images) => ({agent, images}))
    .catch((e) => console.log(e));
}

// Edit a page
const editPage = (page, title, template) => (agent, response) => {
// Need to implement this: Get the content before and only replace on certain
// BOT tags, can be done using HTML comments or something like that.
//	getOriginalPage(page)(agent)
//		.then((originalText) => {
//  });
  getEditToken(page)(agent)
    .catch((e) => console.error(e))
    .then(logJson)
    .then((token) => {
      // We need to split the text because the API won't work with body parameters
      texts = splitText(template.text, 2000).map((text) => ({appendtext: text}))
      texts[0] = { text: texts[0].appendtext }

      return Promise.each(template.usedImages, (image) => postImage(agent, token, image))
        .then(Promise.each(texts, (text) => postEdit(agent, token, title, text)))
        .catch((e) => console.error(e))

    });
};


// Textobj will be appended to the params.
// Need to be like this so we can append or change the entire text of the page
const postEdit = (agent, token, title, textObj) => {
  const params = query(_.merge({
    token,
    action: 'edit',
    title: title,
    bot: true,
    format: 'json'
  }, textObj));


  return new Promise(function(resolve, reject) {
    return agent.post(`http://frackinuniversestaging.wikia.com/api.php?${params}`)
    .catch((e) => console.error(e))
    .then((resp) => resp.body)
    .then(logJson)
    .then((json) => resolve(json))
    .then(resolve)
    .catch(reject)
  })
};

const postImage = (agent, token, imagePath) => {
  const params = {
    token,
    action: 'upload',
    filename: imagePath.replace(/\//g,""),
    format: "json"
  }

  return new Promise(function(resolve, reject) {
    return agent.post(`http://frackinuniversestaging.wikia.com/api.php?${query(params)}`)
      .attach("file", `../FrackinUniverse${imagePath}`)
      .then((resp) => resp.body)
      .then(logJson)
      .then((json) => resolve(json))
      .then(resolve)
      .catch(reject)
  })
}

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
  editPage,
  fetchImagesGivenAgent
};
