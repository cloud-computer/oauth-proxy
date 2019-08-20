import * as express from 'express';
import * as nock from 'nock';
import { decode } from 'querystring';
import * as request from 'supertest';

import { proxyHandler } from '.';

describe('oauth proxy', () => {
  it('proxies requests to users cloud computer', async () => {
    const provider = 'dropbox';
    const username = 'jackson';
    const domain = 'cloud-computer.dev';
    const state = `${provider}.${username}`;
    const code = 'authorization-code';

    // check the oauth request was proxied to the user's cloud computer cloudstorage
    nock(`https://cloudstorage.${username}.${domain}`)
      .get(/.*/)
      .reply(200, (url) => {
        const querystring = url.slice(url.indexOf('?') + 1);
        const queryParams = decode(querystring);
        expect(queryParams.code).toBe(code);
        expect(queryParams.state).toBe(provider);
      });

    const app = express().get('/oauth', proxyHandler);

    // check users are redirected to their cloud-computer
    await request(app)
      .get('/oauth')
      .query({ state, code })
      .expect(302)
      .expect('location', `https://${username}.${domain}`)
  });
});
