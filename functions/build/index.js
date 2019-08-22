"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("cors");
const express = require("express");
const firebase_functions_1 = require("firebase-functions");
const node_fetch_1 = require("node-fetch");
const querystring_1 = require("querystring");
const { CLOUDSTORAGE_SUBDOMAIN = 'cloudstorage', } = process.env;
const routeBySubdomain = async (req, _, next) => {
};
const cloudstorageHandler = async (req, res) => {
    const { query, hostname } = req;
    const { state } = query;
    // state parameter containing subdomain to redirect to and provider to authenticate
    const [provider, username] = state.split('.');
    console.log(`Proxying ${provider} OAuth for ${username} on ${hostname}.`);
    const querystring = querystring_1.encode(Object.assign({}, query, { state: provider }));
    // proxy oauth request to cloudstorage subdomain
    await node_fetch_1.default(`https://${CLOUDSTORAGE_SUBDOMAIN}.${username}.${hostname}?${querystring}`);
    // redirect user to their dashboard
    res.redirect(`https://${username}.${hostname}`);
};
exports.app = express()
    .use(cors({ origin: true }))
    .get('/', cloudstorageHandler);
exports.firebase = firebase_functions_1.https.onRequest(exports.app);
//# sourceMappingURL=index.js.map