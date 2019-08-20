"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const querystring_1 = require("querystring");
const { CLOUD_COMPUTER_DOMAIN_NAME = 'cloud-computer.dev', } = process.env;
exports.proxyHandler = async (req, res) => {
    const { state } = req.query;
    const [provider, username] = state.split('.');
    const querystring = querystring_1.encode(Object.assign({}, req.query, { state: provider }));
    console.log(`Proxying ${provider} OAuth for ${username}.`);
    // proxy oauth request to cloudstorage
    await node_fetch_1.default(`https://cloudstorage.${username}.${CLOUD_COMPUTER_DOMAIN_NAME}?${querystring}`);
    // redirect user to their home page
    res.redirect(`https://${username}.${CLOUD_COMPUTER_DOMAIN_NAME}`);
};
//# sourceMappingURL=index.js.map