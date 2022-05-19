# Share A Meal REST API Server

## Description
A REST API server made for a school project for Avans Hogeschool.

With this API you can add, edit and delete users and meals and you can register and login to your account.

The goal of this API is to share your meal you submitted so you waste less food and meet new people.

## Installation
API is currently running on a heroku server: [shareamealrensl.herokuapp.com/api](https://shareamealrensl.herokuapp.com/api)

If you want to install this server yourself, simply run this command:

``git clone https://github.com/renslakens/programmeren-4-shareameal.git``

Furhter you need to install these libraries with [NPM](https://www.npmjs.com/):

``npm i dotenv express jsonwebtoken mysql2 tracer``

- The library [dotenv](https://www.npmjs.com/package/dotenv) is used for environment variables
- [Express](https://www.npmjs.com/package/express) is used for running the server
- For validating a user the library [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) is used
- [Mysql2](https://www.npmjs.com/package/mysql2) is used for connecting to the online database
- I used logging troughout the API and [tracer](https://www.npmjs.com/package/tracer) is used for that.

## Usage
The current usage is documented at [this](https://shareameal-api.herokuapp.com/docs/) page.

## Support
If you run in to any problems regarding tho this project or another project of mine feel free to contact me at r.lakens@student.avans.nl.

## Authors
- Robin Schellius
- Davide Ambesi
- Rens Lakens

## License
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Project status
[![Deploy to Heroku](https://github.com/renslakens/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/renslakens/programmeren-4-shareameal/actions/workflows/main.yml)