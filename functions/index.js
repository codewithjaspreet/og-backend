
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

// The Firebase Admin SDK to access Firestore.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import express from "express";
import { addGym } from "./admin/admin.js";
import cors from "cors";
import morgan from "morgan";    
import "./utils/utils.js"; // ensures app is initialized
const app = express();

app.use(cors({ origin: true }));                
app.use(express.json({ limit: "1mb" }));         
app.use(morgan("combined")); 
app.get("/", (req, res) => {
    res.send("Hello World").status(200);
});

app.post("/add-gym", (req, res) => {
    addGym(req, res);
});

export const api = onRequest(app);
