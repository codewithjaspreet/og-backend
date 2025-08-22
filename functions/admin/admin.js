
// This File is responsible for all the operations performed by admin for Organised Gym

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { gymInputSchema } from '../schema/gym_schema.js';

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
                status: 400,
                error: "ValidationError",
                details,
            });

        }

        console.error("Error creating gym:", error);
        console.error("Error stack:", error.stack);
        return res.status(500).json({
            status: 500,
            error: "InternalServerError",
            message: "Failed to create gym",
            details: error.message
        });

    }
};

export { addGym };