
// Admin operations for Organized Gym management system
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { userSchema } from '../schema/user_schema.js';


const COLLECTIONS = {
    GYMS: 'gym',
    GYM_PLANS: 'gym_plans',
    USERS: 'users'
  };
  
  const USER_ROLES = {
    OWNER: 'owner',
    MEMBER: 'member'
  };
  
  const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  };



// Utility Functions
/**
 * Standardized error response handler
 */
const handleErrorResponse = (res, error, context = '') => {
    // Handle validation errors
    if (error?.issues && Array.isArray(error.issues)) {
      const details = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: false,
        error: 'ValidationError',
        message: 'Invalid request payload',
        details,
      });
    }
  
    // Log error for debugging
    console.error(`Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
  
    // Handle Firebase Auth errors
    if (error.code && error.code.startsWith('auth/')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: false,
        error: 'AuthenticationError',
        message: error.message,
      });
    }
  
    // Generic server error
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: false,
      error: error?.code || 'InternalServerError',
      message: error?.message || `Failed to ${context}`,
    });
  };
  
  /**
   * Generate a secure random password
   */
  const generateSecurePassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };
  
  /**
   * Find gym reference by name
   */
  const findGymByName = async (db, gymName, collection = COLLECTIONS.GYMS) => {
    if (!gymName?.trim()) {
      return null;
    }
  
    try {
      const snapshot = await db
        .collection(collection)
        .where('gym_name', '==', gymName.trim())
        .limit(1)
        .get();
      
      return snapshot.empty ? null : snapshot.docs[0];
    } catch (error) {
      console.error('Error finding gym by name:', error);
      throw new Error(`Failed to find gym with name: ${gymName}`);
    }
  };
  
  /**
   * Handle user role assignment
   */
  const assignUserRole = async (db, uid, gymName, role) => {
    const normalizedRole = role.toLowerCase();
    
    if (!gymName?.trim()) {
      throw new Error(`active_gym.gym_name is required when role is '${role}'`);
    }
  
    const gymDoc = await findGymByName(db, gymName);
    if (!gymDoc) {
      throw new Error(`No gym found with gym_name='${gymName}' to assign ${role}`);
    }
  
    const gymRef = gymDoc.ref;
    const updateData = {
      updated_at: FieldValue.serverTimestamp(),
    };
  
    switch (normalizedRole) {
      case USER_ROLES.OWNER:
        updateData.owner_id = uid;
        await gymRef.update(updateData);
        break;
  
      case USER_ROLES.MEMBER: {
        // Get current gym data to handle member_list properly
        const gymData = gymDoc.data();
        const currentMembers = gymData.member_list || [];
        
        // Add user to member list if not already present
        if (!currentMembers.includes(uid)) {
          updateData.member_list = [...currentMembers, uid];
          await gymRef.update(updateData);
        }
        break;
      }
  
      default:
    }
  };
  

  /**
 * Add a new user to the system
 */
const addUser = async (req, res) => {
    try {
      const db = getFirestore();
      const auth = getAuth();
  
      // Validate and extract data
      const validatedData = userSchema.parse(req.body ?? {});
      const email = validatedData?.contact_details?.email?.trim();
      const role = validatedData?.role?.toString() || '';
      const activeGymName = validatedData?.active_gym?.gym_name?.trim();
  
      // Validate required email
      if (!email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: false,
          message: 'contact_details.email is required',
        });
      }
  
      // Create Firebase Auth user
      const generatedPassword = generateSecurePassword();
      const userRecord = await auth.createUser({
        email,
        password: generatedPassword,
        emailVerified: false,
        disabled: false,
      });
  
      const uid = userRecord.uid;
  
      // Handle role-specific logic
      if (role && [USER_ROLES.OWNER, USER_ROLES.MEMBER].includes(role.toLowerCase())) {
        await assignUserRole(db, uid, activeGymName, role);
      }
  
      // Create user document in Firestore
      const userData = {
        ...validatedData,
        user_id: uid,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };
  
      await db.collection(COLLECTIONS.USERS).doc(uid).set(userData);
  
      return res.status(HTTP_STATUS.CREATED).json({
        status: true,
        message: 'User created successfully',
        user_id: uid,
        generated_password: generatedPassword,
      });
  
    } catch (error) {
      // Clean up Firebase Auth user if Firestore operation fails
      try {
        if (error.uid) {
          await getAuth().deleteUser(error.uid);
          console.log(`Cleaned up Firebase Auth user: ${error.uid}`);
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
  
      return handleErrorResponse(res, error, 'add user');
    }
  };

const formatUser = (doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      name: data.name,
      created_at: formatDate(data.created_at),
      is_active: data.is_active,
      fees_due_date: formatDate(data.fees_due_date),
      is_fees_paid: data.is_fees_paid,
      date_of_birth: formatDate(data.date_of_birth),
      email: data.email,
      phone: data.phone,
      active_plan: data.active_plan,
    };
  };

  const formatUserDetailing = (doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      name: data.name,
      role: data.role,
      gender: data.gender,
      is_active: data.is_active,
      is_present_today: data.is_present_today,
      is_fees_paid: data.is_fees_paid,
      subscription_status: data.subscription_status,
  
      active_gym: data.active_gym || null,
      active_gym_plan: data.active_gym_plan || null,
      active_subscription_plan: data.active_subscription_plan || null,
      subscription_plan: data.subscription_plan,
      active_plan: data.active_plan,
  
      created_at: formatDate(data.created_at),
      updated_at: formatDate(data.updated_at),
      date_of_birth: formatDate(data.date_of_birth),
      fees_due_date: formatDate(data.fees_due_date),
      check_in_time_today: formatDate(data.check_in_time_today),
      check_out_time_today: formatDate(data.check_out_time_today),
  
      email: data.contact_details?.email || data.email,
      phone: data.contact_details?.phone || data.phone,
      whatsapp: data.contact_details?.whatsapp || null,
  
      profile_picture: data.profile_picture,
      address: data.address || null,
      measurements: data.measurements || null,
  
      announcements: data.announcements || [],
      feedbacks: data.feedbacks || [],
      gym_logo: data.active_gym?.gym_logo || null,
  
      user_id: data.user_id
    };
  };

  const formatDate = (date) => {
    if (!date) return null;
    if (date.toDate) return date.toDate().toISOString().split("T")[0];
    if (date instanceof Date) return date.toISOString().split("T")[0];
    return date;
  };

  
const getMemberListing = async (req, res) => {
    try {
      const query = req.query;
      const db = getFirestore();
      const user_collection = db.collection(COLLECTIONS.USERS);
  
      const user_id = query.user_id;
      const gym_name = query.gym_name;
      const last_doc_id = query.last_doc_id;
      const payments = query.payments;
      const birthday = query.birthday;
  
      const PAGE_SIZE = 10;

      if (user_id) {
        const user = await user_collection.doc(user_id).get();
  
        if (!user.exists) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            status: false,
            message: "User not found",
          });
        }
  
        return res.status(HTTP_STATUS.OK).json({
          status: true,
          message: "User details fetched successfully",
          user: formatUser(user),
        });
      }
  
      if (gym_name) {
        let queryRef = user_collection
          .where("active_gym.gym_name", "==", gym_name)
          .limit(PAGE_SIZE);
  
        if (last_doc_id) {
          const lastDocSnapshot = await user_collection.doc(last_doc_id).get();
          if (lastDocSnapshot.exists) {
            queryRef = queryRef.startAfter(lastDocSnapshot);
          } else {
            return res.status(HTTP_STATUS.OK).json({
              status: true,
              message: "No more members",
              members: [],
              last_doc_id: null,
              has_more: false,
            });
          }
        }
  
        const snapshot = await queryRef.get();
  
        if (snapshot.empty) {
          return res.status(HTTP_STATUS.OK).json({
            status: true,
            message: "No more members",
            members: [],
            last_doc_id: null,
            has_more: false,
          });
        }
  
        // Prepare members
        let members = snapshot.docs.map(formatUser);
  
        if (birthday) {
          members.sort((a, b) => {
            const ad = a.date_of_birth ? new Date(a.date_of_birth) : null;
            const bd = b.date_of_birth ? new Date(b.date_of_birth) : null;
            if (!ad && !bd) return 0;
            if (!ad) return 1;
            if (!bd) return -1;
            return ad - bd;
          });
        }
  
        if (payments) {
          members.sort((a, b) => {
            const af = a.fees_due_date ? new Date(a.fees_due_date) : null;
            const bf = b.fees_due_date ? new Date(b.fees_due_date) : null;
            if (!af && !bf) return 0;
            if (!af) return 1;
            if (!bf) return -1;
            return af - bf;
          });
        }
  
        members = members.slice(0, PAGE_SIZE);
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
        let has_more = false;
        {
          let nextRef = user_collection
            .where("active_gym.gym_name", "==", gym_name)
            .startAfter(lastVisible)
            .limit(1);
          const nextSnap = await nextRef.get();
          has_more = !nextSnap.empty;
        }
  
        return res.status(HTTP_STATUS.OK).json({
          status: true,
          message: "User details fetched successfully",
          members,
          last_doc_id: lastVisible.id,
          has_more,
        });
      }
  
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: false,
        message: "Invalid request parameters",
      });
    } catch (error) {
      return handleErrorResponse(res, error, "get user details");
    }
  };


  const getUserDetailing = async (req, res) => {
    try {
      const query = req.query;
      const db = getFirestore();
      const user_collection = db.collection(COLLECTIONS.USERS);

      const user_id = query.user_id;

      if (!user_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: false,
          message: "user_id is required",
        });
      }

      const user = await user_collection.doc(user_id).get();
      if (!user.exists) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(HTTP_STATUS.OK).json({
        status: true,
        message: "User details fetched successfully",
        user: formatUserDetailing(user) ,
      });
    }
    catch (error) {
      return handleErrorResponse(res, error, "get user detailing");
    }
  }
  
  
export {
    addUser,getMemberListing,getUserDetailing
}