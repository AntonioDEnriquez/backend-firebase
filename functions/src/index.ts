import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

// Comandos npm run build && firebase emulators:start --only functions y tsc --watch

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firestore-grafica-3a1b7-default-rtdb.firebaseio.com",
});

// Referencia a firestore
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.json({
    mensaje: "Hola mundo desde Funciones de Firebase!!!",
  });
});

export const getGOTY = functions.https.onRequest(async (request, response) => {

  // const gotyRef = db.collection('goty');

  // // Referencia a la base de datos de como se encuentra en ese momento
  // const docsSnap = await gotyRef.get();

  // // lo pasamos por el metodo map que tiene todos los arreglos y esto regresa un nuevo arreglo en base a la condicion que tenemos
  // // funcion tenemeos que por cada documento nos regresa la data
  // const juegos = docsSnap.docs.map(doc => doc.data());

  // // Informacion las coleciones
  // response.json(juegos);
});

// Puedo crearme un servidor de express ya que todo esta corriendo sobre node
// Instalamos npm install express cors en la carpeta functions para que nos los cree dentro de la carpeta node_modules que ya tenemos

// Instalamos npm install @types/express --save-dev para el tipado y tambien con el npm install @types/cors --save-dev

// creamos constante e inicializamos la app
const app = express();

// establecemos las cors para que la aplicacion acepte peticiones de otros dominios
app.use(cors({ origin: true }));

app.get("/goty", async (req, res) => {
  const gotyRef = db.collection("goty");
  const docsSnap = await gotyRef.get();
  const juegos = docsSnap.docs.map((doc) => doc.data());

  res.json(juegos);
});

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;


  const gameRef = db.collection("goty").doc(id);
  const gameSnap = await gameRef.get();


  if (!gameSnap.exists) {
    res.status(404).json({
      ok: false,
      mensaje: `No existe un juego con ese ID "${id}"`,
    });
  } else {
    const antes = gameSnap.data() || { votos: 0 };
    await gameRef.update({
      votos: antes.votos + 1,
    });

    res.json({
      ok: true,
      mensaje: `Gracias por su voto a ${antes.name}`,
    });
  }
});


// Le decimos a firebase que ahora tiene un servidor de express corriendo dentro
export const api = functions.https.onRequest(app);
