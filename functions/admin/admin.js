
// This File is responsible for all the operations performed by admin for Organised Gym

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { gymInputSchema } from '../schema/gym_schema.js';
import { gymPlansInputSchema } from '../schema/gym_plans_schems.js';
import { userSchema } from '../schema/user_schema.js';

const addGym = async (req, res) => {
    try {

        const gymCollection = getFirestore().collection("gym");
        const validatedData = gymInputSchema.parse(req.body ?? {});

        const gymDocument = await gymCollection.add(
            {
                created_at: FieldValue.serverTimestamp(),
                updated_at: FieldValue.serverTimestamp(),
                ...validatedData
            }

        );

        return res.status(201).json({
            status: true,
            message: "Gym added successfully",
            gym_id: gymDocument.id
        })



    } catch (error) {

        if (error?.issues && Array.isArray(error.issues)) {
            const details = error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            }));
            return res.status(400).json({
                status: false,
                error: "ValidationError",
                details,
            });

        }

        console.error("Error creating gym:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({
            status: false,
            error: "InternalServerError",
            message: "Failed to create gym",
            details: error.message
        });

    }
};

const addGymPlans = async (req, res) => {

    try{

        const gymPlansCollection = getFirestore().collection("gym_plans");
        const validatedData = gymPlansInputSchema.parse(req.body ?? {});

        const gymPlansDocument = await gymPlansCollection.add(
            {
                created_at: FieldValue.serverTimestamp(),
                updated_at: FieldValue.serverTimestamp(),
                ...validatedData
            }
        );

        return res.status(201).json({
            status: true,
            message: "Gym plans added successfully",
            gym_plans_id: gymPlansDocument.id
        })

    }
    catch(error){

        if (error?.issues && Array.isArray(error.issues)) {
            const details = error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            }));
            return res.status(400).json({
                status: false,
                error: "ValidationError",
                details,
            });
        }

        console.error("Error creating gym plans:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({
            status: false,
            error: "InternalServerError",
            message: "Failed to create gym plans",
            details: error.message
        });

    }
}


const addUser = async (req, res) => {

    try{

        const userCollection = getFirestore().collection("users");
        const validatedData = userSchema.parse(req.body ?? {});

        const userDocument = await userCollection.add(
            {
                created_at: FieldValue.serverTimestamp(),
                ...validatedData


            }
        );

        return res.status(201).json({
            status: true,
            message: "User added successfully",
            user_id: userDocument.id
        })

    }
    catch(error){

        if (error?.issues && Array.isArray(error.issues)) {
            const details = error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            }));
        }

        console.error("Error creating user:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({
            status: false,
            error: "InternalServerError",
            message: "Failed to create user",
            details: error.message
        });

    }
}

export { addGym ,addGymPlans,addUser };


