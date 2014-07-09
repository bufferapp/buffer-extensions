Buffer Extensions Master Repo
=============================

For help with using this repo and it's nested repos see the [Buffer hackpad](https://buffer.hackpad.com/Extensions-Shared-Repos-101-7AswcCRsHEI).

## Install

    $ npm install

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
