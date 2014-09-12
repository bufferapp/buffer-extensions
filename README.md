Buffer Extensions Master Repo
=============================

For help with using this repo and it's nested repos see the [Buffer hackpad](https://buffer.hackpad.com/Extensions-Shared-Repos-101-7AswcCRsHEI).

## Install

After cloning the repo, you'll need all of the subrepos. To pull in nested subrepos:

    $ git submodule update --recursive --merge --init

To install all necessary packages for grunt:

    $ npm install -g grunt-cli
    $ npm install

Download the Firefox addon SDK:

    $ git clone https://github.com/mozilla/addon-sdk.git sdks/firefox

## Grunt helper tasks

Update the nested "buffer-<browser>" repos.

    $ grunt update-repos

Update the nested "buffer-extension-shared" repos in each browser repo.

    $ grunt update-shared

Update the version in main `package.json` and have it update each browser's
version.

    $ grunt update-versions

## Test

This currently only tests the Chrome sub-repo's shared code.

    $ grunt mocha

## Build

    $ grunt chrome
    $ grunt firefox
