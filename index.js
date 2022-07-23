const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xabdk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

   try {
      await client.connect();
      const productCollection = client.db('coatsBD').collection('product');
      const itemsCollection = client.db('coatsBD').collection('items');

      // Auth
      app.post('/login', async (req, res) => {
         const user = req.body;
         const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
         });
         res.send(accessToken);
      });



      app.get('/product', async (req, res) => {
         const query = {};
         const cursor = productCollection.find(query);
         const products = await cursor.toArray();
         res.send(products);
      });
      app.get('/product/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const product = await productCollection.findOne(query);
         res.send(product);
      })
      // Post
      app.post('/product', async (req, res) => {
         const newProduct = req.body;
         const result = await productCollection.insertOne(newProduct)
         res.send(result);
      });

      // Delete
      app.delete('/product/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await productCollection.deleteOne(query);
         res.send(result);
      })

      // My Items API
      app.post('/items', async (req, res) => {
         const items = req.body;
         const result = await itemsCollection.insertOne(items);
         res.send(result);
      })
      app.get('/items', async (req, res) => {
         const email = req.query.email;
         console.log(email)
         const query = { email: email };
         const cursor = itemsCollection.find(query);
         const items = await cursor.toArray();
         res.send(items);
      });


   }
   finally {

   }
}

run().catch(console.dir);

app.get('/', (req, res) => {
   res.send('Running  Server');
});

app.listen(port, () => {
   console.log('Listening to port', port);
})