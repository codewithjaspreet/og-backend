
// This File is responsible for all the operations performed by admin for Organised Gym

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { gymInputSchema } from '../schema/gym_schema.js';
import { gymPlansInputSchema } from '../schema/gym_plans_schema.js';
import { userSchema } from '../schema/user_schema.js';
import { getAuth } from "firebase-admin/auth";
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

    try {

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
    catch (error) {

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


async function findGymRefByName(db, gymName, { collection = "gyms" } = {}) {
    if (!gymName) return null;
    const snap = await db.collection(collection).where("gym_name", "==", gymName).limit(1).get();
    return snap.empty ? null : snap.docs[0].ref;
  }
  
  const addUser = async (req, res) => {
    try {
      const db = getFirestore();
      const auth = getAuth();
  
      const data = userSchema.parse(req.body ?? {});
      const email = data?.contact_details?.email?.trim();
      const role = (data?.role || "").toString();
      const activeGymName = data?.active_gym?.gym_name?.trim();
  
      if (!email) {
        return res.status(400).json({
          status: false,
          message: "contact_details.email is required",
        });
      }
  
      const generatedPassword = Math.random().toString(36).slice(-10);
      const userRecord = await auth.createUser({
        email,
        password: generatedPassword,
        emailVerified: false,
        disabled: false,
      });
      const uid = userRecord.uid;
  
      if (role.toLowerCase() === "owner") {
        if (!activeGymName) {
          return res.status(400).json({
            status: false,
            message:
              "active_gym.gym_name is required when role is 'Owner' to map the gym owner.",
          });
        }
  
        const gymRef = await findGymRefByName(db, activeGymName, { collection: "gym" }); 
        if (!gymRef) {
          return res.status(404).json({
            status: false,
            message: `No gym found with gym_name='${activeGymName}' to map owner.`,
          });
        }
  
        await gymRef.set(
          {
            owner_id: uid, 
            updated_at: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
  
      await db.collection("users").doc(uid).set({
        ...data,
        user_id: uid,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
  
      return res.status(201).json({
        status: true,
        message: "User created successfully",
        user_id: uid,
        generated_password: generatedPassword,
      });
    } catch (error) {
      if (error?.issues && Array.isArray(error.issues)) {
        const details = error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));
        return res.status(400).json({
          status: false,
          error: "ValidationError",
          message: "Invalid request payload",
          details,
        });
      }
  
      console.error("Error creating user:", error);
      return res.status(500).json({
        status: false,
        error: error?.code || "InternalServerError",
        message: error?.message || "Failed to create user",
      });
    }
  };


export { addGym, addGymPlans, addUser };