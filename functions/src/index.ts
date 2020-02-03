import * as cors from 'cors';
import * as express from 'express';
import { Request, Response } from 'express';
import { https } from 'firebase-functions';
import fetch from 'node-fetch';
import { encode } from 'querystring';

const {
  AUTH_SUBDOMAIN = 'auth',
  CLOUDSTORAGE_SUBDOMAIN = 'cloudstorage',
} = process.env;

const routeBySubdomain = (req: Request, res: Response) => {
  const handlers = {
    [AUTH_SUBDOMAIN]: authHandler,
    [CLOUDSTORAGE_SUBDOMAIN]: cloudstorageHandler,
  };
  const notFound = () => res.status(404).send();

  const { hostname } = req;
  const [subdomain] = hostname.split('.');
  const handler = handlers[subdomain] || notFound;

  // Handle the route
  handler(req, res);
};

const cloudstorageHandler = async (req: Request, res: Response) => {
  const { query, hostname } = req;
  const { state } = query;

  // state parameter containing user subdomain to redirect to and provider to authenticate
  const [provider, username] = state.split('.');
  const domain = hostname.split('.').slice(-2).join('.');

  console.log(`Proxying cloudstorage ${provider} oauth for ${username} on ${domain}.`);

  const querystring = encode({
    ...query,
    state: provider,
  });

  // proxy oauth request to cloudstorage service
  await fetch(`https://${CLOUDSTORAGE_SUBDOMAIN}.${username}.${domain}?${querystring}`);

  // redirect user to their dashboard
  res.redirect(`https://${username}.${domain}`);
}

const authHandler = async (req: Request, res: Response) => {
  const { query, hostname } = req;
  const { state } = query;

  // state parameter containing user subdomain to redirect to
  const username = state.split(':')[2].split('.')[1];
  const domain = hostname.split('.').slice(-2).join('.');
  const querystring = encode(query);

  console.log(`Proxying auth oauth for ${username} on ${domain}.`);

  // redirect user the oauth handler
  res.redirect(`https://${AUTH_SUBDOMAIN}.${username}.${domain}/_oauth?${querystring}`);
}

export const app = express()
  .use(cors({ origin: true }))
  .get('/healthcheck', (req: Request, res: Response) => res.send('healthcheck'))
  .use(routeBySubdomain)

export const firebase = https.onRequest(app);
