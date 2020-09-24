const express = require('express');
const knex = require('knex');
const redis = require('redis');
const util = require("util");
const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);
client.get = util.promisify(client.get);
const app = express();
const db = knex({
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'epspexet',
    },
  });
  app.get('/', async (req, res) => {
    const debut = Date.now();
    const resultatsEnCache = await client.get('resultats');
    if (resultatsEnCache) {
      console.log('Temps écoulé[CACHE] : ', Date.now() - debut, 'ms');
      return res.send(JSON.parse(resultatsEnCache));
    }
    const resultats = await db.select().table('resultats');
    client.set('resultats', JSON.stringify(resultats),'EX',70);
    console.log('Temps écoulé[MYSQL] : ', Date.now() - debut, 'ms');
    return res.send(resultats);
  });
  app.listen(3000, () => console.debug('Le serveur écoute sur le port 3000'));