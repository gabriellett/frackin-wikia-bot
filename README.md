# Frackin Wikia BOT

A ~bot-ish script created so the FrackinUniverse Wikia gets updated automatically

Supported thigs:

* [in-progress] Stars main page

## Requirements:

* node 8.1.2 (might work in older versions, not sure)
* rhash (So we can compare images between frackin unverse and wikia)

## Installing

* run `npm install`

## Configuring

Export the following env-vars:

```
FRABOT_WIKIA_USERNAME=yourusername
FRABOT_WIKIA_PASSWORD=yourpassword
```

## Run

* ON the FrackinUniverse mod folder run:
```
(echo "{\n" && rhash -r --sha1 -p '"%p": "%h",\n' . && echo " \"null\": null\n }") > hashes.json
```

This will generate a hash.json file with all the paths and hashes for every file in the repo

And run using: 
```
node index.js
```

## Contibuting

Check [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
 
This project is available under the [MIT](LICENSE.md) license.
