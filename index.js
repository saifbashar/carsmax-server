const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');

require('dotenv').config();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Staring database connection
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.aq09p.mongodb.net:27017,cluster0-shard-00-01.aq09p.mongodb.net:27017,cluster0-shard-00-02.aq09p.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-10euq8-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db('carsMax');
    const carsCollection = database.collection('cars');
    const reviewCollection = database.collection('review');
    const userCollection = database.collection('users');
    const ordersCollection = database.collection('orders');
    const adminCollection = database.collection('admin');
    console.log('Connected to database');
    // Car Collection
    app.get('/cars', async (req, res) => {
      console.log(req.query.search);
      const query = {};
      if (req?.query?.search) {
        const cursor = await carsCollection
          .find(query)
          .limit(parseInt(req.query.search));
        const cars = await cursor.toArray();
        res.send(cars);
      } else {
        const cursor = await carsCollection.find(query);
        const cars = await cursor.toArray();
        res.json(cars);
      }
    });
    // post carsCollection
    app.post('/cars', async (req, res) => {
      // console.log(req.body);
      const { name, description, image, price, mileage, band } = req.body;
      console.log(req.body);
      const reviewData = { name, description, image, price, mileage, band };
      const result = await carsCollection.insertOne(reviewData);
      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(result);
    });
    // Find cars by id
    app.get('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await carsCollection.find(query);
      const car = await cursor.toArray();
      res.json(car);
    });
    // Car delete cars by id
    app.delete('/cars/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      // console.log('Hitting Delete', result);
      res.json(result);
    });
    // Set users
    app.post('/users', async (req, res) => {
      // console.log('Posting user');
      // console.log(req.body);
      const { name, email, role, password, uid } = req.body;
      const user = { name, email, role, password, uid };
      const result = await userCollection.insertOne(user);

      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(result);
    });
    // All Users
    app.get('/users', async (req, res) => {
      const query = {};
      const cursor = await userCollection.find(query);
      const users = await cursor.toArray();
      res.json(users);
    });
    // update a user
    app.put('/users/:id', async (req, res) => {
      const { id } = req.params;

      const result = await userCollection.updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            role: 'admin',
          },
        }
      );
      // console.log(`A document was updated with the _id: ${result.insertedId}`);
      res.json(result);
    });

    // Find user by id

    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { email: id };
      console.log(query);
      const cursor = await userCollection.find(query);
      const user = await cursor.toArray();
      res.json(user);
    });
    // review
    app.post('/reviews', async (req, res) => {
      // console.log(req.body);
      const { name, email, quotes, reviewPoints } = req.body;
      const reviewData = { name, email, quotes, reviewPoints };
      const result = await reviewCollection.insertOne(reviewData);
      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(result);
    });
    // All reviews
    app.get('/reviews', async (req, res) => {
      const query = {};
      const cursor = await reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    // All order post
    app.post('/orders', async (req, res) => {
      // console.log(req.body);
      const {
        name,
        email,
        phone,
        address,
        uid,
        carId,
        status,
        carName,
        carPrice,
        carImage,
      } = req.body;
      const orderData = {
        name,
        email,
        phone,
        address,
        uid,
        carId,
        carName,
        carPrice,
        carImage,
        status,
      };
      const result = await ordersCollection.insertOne(orderData);

      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(result);
    });
    // All orders were successfully
    app.get('/orders', async (req, res) => {
      // console.log('Hello');
      const query = {};
      const cursor = await ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });
    // individual orders collection
    app.get('/orders/:email', async (req, res) => {
      const id = req.params.email;
      // console.log(id);
      const query = { email: id };
      const cursor = await ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });
    // delete ordersCollection
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      // console.log(`A document was deleted with the _id: ${result.insertedId}`);
      res.json(result);
    });

    // update order collection
    app.post('/orders/:id', async (req, res) => {
      // console.log('Hello');
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'Shipped',
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      // console.log(filter);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));
