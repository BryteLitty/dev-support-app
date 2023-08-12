import { account, db, storage } from "./appwrite";
import { ID } from 'appwrite';


// function to authenticate staff
const checkUserFromList = async (email, router) => {
    try {
        const res = await db.listDocuments(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_USERS_COLLECTION_ID
        );

        const users = res.documents;
        const result = users.filter((user) => user.email === email);

        if(result.length > 0) {
            successMessage("Welcome back 🎉");
            router.push('/staff/dashboard');
        } else {
            errorMessage("Unauthorized...Contact Management");
        }
    } catch (err) {
        console.error(err)
    }
}

// authenticate user
export const login = async(email, password, router) => {
    try {
        // appwrite login method
        await account.createEmailSession(email, password);

        // calls the filter function
        await checkUserFromList(email, password, router);
    } catch (err) {
        console.log(err);
        errorMessage("Invalid credentials ❌")
    }
};

// function to logout
export const logout = async (router) => {
    try {
        await account.deleteSession("current");
        router.pus("/");
        successMessage("See ya later 🎉");
    } catch (err) {
        console.log(err);
        errorMessage("Oop! Encountered an error 😪")
    }
}

// denying unauthenticated users access
export const checkAuthStatus = async (setUser, setLoading, router) => {
    try {
        const res = await account.get();
        setUser(res);
        setLoading(false);
    } catch (err) {
        router.push("/");
        console.error(err);
    }
}


// ADDING STAFF NEW STAFF
// generate random string as ID
const generateID = () => Math.random().toString(36).substring(2, 24);

export const addUser = async (name, email, password) => {
    try {
        // create a new account on Appwrite Auth
        await account.create(generateID(), email, password, name);
        
        await db.createDocument(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_USERS_COLLECTION_ID,
            ID.unique(),
            { user_id: generateID(), name, email }
        );
        successMessage("User added successfully")
    } catch {err} {
        console.log(err);
    }
};


// getting the staff list
export const getUsers = async (setUsers) => {
    try {
        const response = await db.listDocuments(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_USERS_COLLECTION_ID
        );
        setUsers(response.documents);
    } catch (err) {
        console.log(err)
    }
};


// removing staff
export const deleteUser = async (id) => {
    try {
        await db.deleteDocument(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_USERS_COLLECTION_ID,
            id
        );
        successMessage('User removed')
    } catch(err) {
        console.log(err);
        errorMessage("Encountered an error");
    }
};