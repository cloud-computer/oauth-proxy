import * as nock from 'nock';
import { decode, encode } from 'querystring';
import * as request from 'supertest';

import { app } from '.';

describe('oauth proxy', () => {
  it('cloudstorage oauth proxied to cloudstorage service and user redirected to dashboard', async () => {
    const code = 'authorization-code';
    const domain = 'cloud-computer.app';
    const provider = 'dropbox';
    const username = 'jackson';

    const oauthSubdomain = `cloudstorage.oauth.${domain}`;
    const userSubdomain = `${username}.${domain}`;

    // state parameter containing subdomain to redirect to and provider to authenticate
    const state = `${provider}.${username}`;

    // check the oauth request was proxied to the user's cloudstorage service
    nock(`https://cloudstorage.${userSubdomain}`)
      .get(/.*/)
      .reply(200, (url) => {
        const querystring = url.slice(url.indexOf('?') + 1);
        const queryParams = decode(querystring);
        expect(queryParams.code).toBe(code);
        expect(queryParams.state).toBe(provider);
      });

    // check the user is redirected to their cloud-computer dashboard
    await request(app)
      .get('/')
      .set('Host', oauthSubdomain)
      .query({ state, code })
      .expect(302)
      .expect('location', `https://${userSubdomain}`);
  });

  it('auth oauth redirected user to auth service', async () => {
    const code = 'authorization-code';
    const domain = 'cloud-computer.app';
    const username = 'jackson';

    const oauthSubdomain = `auth.oauth.${domain}`;
    const authSubdomain = `auth.${username}.${domain}`;

    // state parameter containing subdomain to redirect to
    const state = `9f6448c7bd24c723d0f98429474412da:https://photoshop.${username}.${domain}`;
    const querystring = encode({ code, state });

    // check the user is redirected to the auth service oauth route
    await request(app)
      .get('/')
      .set('Host', oauthSubdomain)
      .query(querystring)
      .expect(302)
      .expect('location', `https://${authSubdomain}/_oauth?${querystring}`);
  });

  it('unhandled url returns 404', async () => {
    await request(app)
      .get('/')
      .set('Host', 'notfound.oauth.jackson.cloud-computer.app')
      .expect(404);
  });

  it('healthchecks', async () => {
    await request(app)
      .get('/healthcheck')
      .expect('healthcheck');
  });
});
