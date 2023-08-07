# Yunna
Your lovely extensible framework to interact with Facebook API.

## Installation
Github:
```
git clone https://github.com/cspi-git/yunna
```

NpmJS:
```
npm i randomstring crypto chalk nodejs-file-downloader parallel-park querystring prettyoutput shell-quote readline-sync columnify minimist axios path uuid lodash fs
```

## Usage
```
node index.js
```

## Walkthrough
Shows Yunna help menu and the list of the current plugins & on how to set your Facebook access token to be able to use other plugins.

```
$ node index.js
yunna[>] help

Note:
For "id" argument, name, email & phone number may also works.
For "user" stuff, group also works.

General Commands
================

    Command                     Description
    -------                     -----------
    help                        Show this.
    whoami                      Current Facebook account (Access token) information.
    set                         Set your Discord account access token for all plugins (Except: getAccessToken) in Yunna, this is a must.
    use                         Use the specified plugin.
    plugins                     Show the loaded plugins.
    version                     Show this current Yunna version.
    exit                        Exit Yunna.

Plugin Commands
===============
    Command                     Description
    -------                     -----------
    run                         Run plugin.
    arguments                   Show plugin arguments.
    info                        Show plugin information.

yunna[>] plugins

Name                 Code                 Authors              Description
Download User Photos dup                  I2rys                Download the specified user photos.     
Get Access Token     gat                  I2rys                Get the specified account access token. 
Save User Albums     sua                  I2rys                Scrape & save the specified user albums.
Save User Posts      sup                  I2rys                Scrape & save the specified user posts.
User Information     ui                   I2rys                Get the specified user information.

yunna[>] use gat
yunna/gat[>] arguments

Name                 Required             Description
email                true                 Account email.
password             true                 Account password.

yunna/gat[>] run --email example@gmail.com --password examplePassword 
❮ツ❯ The account access token is secretFacebookAccessToken
yunna/gat[>] set secretFacebookAccessToken
yunna/gat[>] whoami

First Name: firstName
Last Name: lastName
Name: name
ID: id
Link: profileLink
Timezone: timezone
Email: email
Verified: isVerified
Locale: locale

yunna/gat[>] exit
```

## License
MIT © CSPI