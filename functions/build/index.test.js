"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nock = require("nock");
const querystring_1 = require("querystring");
const request = require("supertest");
const _1 = require(".");
describe('oauth proxy', () => {
    it('cloudstorage oauth proxied to cloudstorage service and user redirected to dashboard', async () => {
        const code = 'authorization-code';
        const domain = 'cloud-computer.app';
        const provider = 'dropbox';
        const service = 'cloudstorage';
        const username = 'jackson';
        const oauthSubdomain = `${service}.oauth.${domain}`;
        const userSubomain = `${username}.${domain}`;
        // state parameter containing subdomain to redirect to and provider to authenticate
        const state = `${provider}.${username}`;
        // check the oauth request was proxied to the user's cloud computer cloudstorage service
        nock(`https://${service}.${userSubomain}`)
            .get(/.*/)
            .reply(200, (url) => {
            const querystring = url.slice(url.indexOf('?') + 1);
            const queryParams = querystring_1.decode(querystring);
            expect(queryParams.code).toBe(code);
            expect(queryParams.state).toBe(provider);
        });
        // check users are redirected to their cloud-computer dashboard
        await request(_1.app)
            .get('/')
            .set('Host', oauthSubdomain)
            .query({ state, code })
            .expect(302)
            .expect('location', `https://${oauthSubdomain}`);
    });
});
//# sourceMappingURL=index.test.js.map