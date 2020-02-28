// import libraries
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
// import { user } from "firebase-functions/lib/providers/auth";

//initialize firebase
admin.initializeApp(functions.config().firebase);

//initialize express server
const app = express();
const main = express();

//add the path to receive req and set json as body parser to process the body
main.use("/api/v1", app);
main.use(bodyParser.json());
// main.use(bodyParser.urlencoded({ extended: false }));

//initialize the db and the collection
const db = admin.firestore();
const userCollection = "users";

//define google cloud function name
export const webApi = functions.https.onRequest(main);

app.get("/warmup", (req, res) => {
  res.send("halo selamat malam");
});

const userQuerySnapshot = db.collection(userCollection);

// get all users
app.get("/halos", async (req, res) => {
  try {
    const users: any = [];
    await userQuerySnapshot.get().then(snapshots => {
      snapshots.forEach(doc => {
        if (doc.exists) users.push(doc.data());
      });
    });
    res.status(200).send(users);
    res.json(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

// get data by Id
app.get("/halos/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    let user: any = {};
    await userQuerySnapshot
      .doc(userId)
      .get()
      .then(doc => {
        if (doc.exists) {
          user = doc.data();
        }
      });
    res.json(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// create new user
app.post("/halos", async (req, res) => {
  try {
    const { firstName, lastName, email, id } = req.body;
    const data = {
      firstName,
      lastName,
      email,
      id
    };

    if (!firstName || !lastName || !email) throw new Error("field can't be empty");

    const userRef = db.collection(userCollection).doc();
    const userRefId = userRef.id;
    data.id = userRefId;

    await userRef.set(data).then(result => {
      return data;
    });
    res.json(data);
  } catch (error) {
    res.status(400).send(error);
  }
});

//  delete data by id
app.delete("/halos/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) throw new Error("id is blank");

    await db
      .collection(userCollection)
      .doc(userId)
      .delete()
      .then(() => res.status(201).send("data deleted"));
  } catch (error) {
    res.status(500).send(error);
  }
});

//  update data by id
app.put("/halos/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    };

    if (!userId) throw new Error("id is blank");
    if (!data) throw new Error("data is required");
    await db
      .collection(userCollection)
      .doc(userId)
      .set(data, { merge: true })
      .then(() => res.status(201).send(data));
  } catch (error) {
    res.status(500).send(error);
  }
  // try {
  //   await db
  //     .collection(userCollection)
  //     .doc(req.params.userId)
  //     .set(req.body, { merge: true })
  //     .then(() => res.json({ id: req.params.userId }));
  // } catch (error) {
  //   res.status(500).send(error);
  // }
});
