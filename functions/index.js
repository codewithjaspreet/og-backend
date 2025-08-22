
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import { addGym,addGymPlans } from "./admin/admin.js";
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

app.post("/add-gym-plans", (req, res) => {
    addGymPlans(req, res);
});

export const api = onRequest(app);
