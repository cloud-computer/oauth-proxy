import * as express from 'express';
import fetch from 'node-fetch';
import { encode } from 'querystring';

const {
  CLOUD_COMPUTER_DOMAIN_NAME = 'cloud-computer.dev',
} = process.env;

export const proxyHandler = async (req: express.Request, res: express.Response) => {
  const { state } = req.query;
  const [provider, username] = state.split('.');

  const querystring = encode({
    ...req.query,
    state: provider,
  });

  console.log(`Proxying ${provider} OAuth for ${username}.`);

  // proxy oauth request to cloudstorage
  await fetch(`https://cloudstorage.${username}.${CLOUD_COMPUTER_DOMAIN_NAME}?${querystring}`);

  // redirect user to their home page
  res.redirect(`https://${username}.${CLOUD_COMPUTER_DOMAIN_NAME}`);
}
