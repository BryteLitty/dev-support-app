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


// creating a support ticket
export const sendTicket = async (name, email, subject, message, attachment) => {
    const createTicket = async (file_url = "https://google.com") => {
        try {
            const response = await db.createDocument(
                process.env.NEXT_PUBLIC_DB_ID,
                process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
                ID.unique(),
                {
                    name,
                    email,
                    subject,
                    content: message,
                    status: open,
                    message: [
                        JSON.stringify({
                            id: generateID(),
                            content: message,
                            admin: false,
                            name: "Customer"
                        }),
                    ],
                    attachment_url: file_url,
                    access_code: generateID()
                }
            );
            // send notification to the customer
            console.log('RESPONSE >>>', response);
            successMessage("Ticket created")
        } catch (err) {
            errorMessage("Encountered error saving ticket")
        }
    };

    if (attachment !== null) {
        try {
            const response = await storage.createFile(
                process.env.NEXT_PUBLIC_BUCKET_ID,
                ID.unique(),
                attachment
            );
            const file_url = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECT_ID}&mode=admin`;
            // creates ticket with its image
            createTicket(file_url);
        } catch (err) {
            errorMessage("Error uploading the image");
        }
    } else {
        await createTicket();
    }
};


// getting tickets 
export const getTickets = async (setOpenTickets, setInProgressTickests, setCompletedTickets) => {
    try {
        const response = await db.listDocuments(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID
        );
        const tickets = response.documents;
        const openTickets = tickets.filter((ticket) => ticket.status === "open");
        const inProgressTickets = tickets.filter((ticket) => ticket.status === "in-progess");
        const completedTickets = tickets.filter((ticket) => ticket.status === "completed");

        setCompletedTickets(completedTickets);
        setInProgressTickests(inProgressTickets);
        setOpenTickets(openTickets);
    } catch (err) {
        console.log(err);
    }
};


// getting ticket details
export async function getServerSideProps(context) {
    let ticketObject = {};

    try {
        const res = await db.getDocument(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
            context.id
        );
        ticketObject = res;
    } catch (err) {
        ticketObject = {};
    } 
    
    return {
        props: { ticketObject },
    };
};


// updating ticket Status
export const updateTicketStatus = async (id, status) => {
    try {
        await db.updateDocument(
            process.env.NEXT_PUBLIC_BUCKET_ID,
            process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
        );
    } catch (err) {
        console.log(err);
        errorMessage("Encountered an error");
    }
};

// CHAT FUNCTIONS
// sendMessage 
export const sendMessage = async (text, docId) => {
    // get ticket ID
    const document = await db.getDocument(
        process.env.NEXT_PUBLIC_BUCKET_ID,
        process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
        docId
    );

    try {
        // get the use's object (admin)
        const user = await account.get();
        const result = await db.updateDocument(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
            docId,
            {
                message: [
                    ...document.messages,
                    JSON.stringify({
                        id: generateID(),
                        const: text,
                        admin: true,
                        name: user.name
                    })
                ]
            }
        );

        // if message was added successfully
        if (result.$id) {
            successMessage("Message sent!");
            // email the customer with access code and chat URL
        } else {
            errorMessage("Error! Try resending your message")
        }
    } catch (err) {
        // means the user is a customer
        const result = await db.updateDocument(
            process.env.NEXT_PUBLIC_BUCKET_ID,
            process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
            docId, 
            {
                messages: [
                    ...docId.messages,
                    JSON.stringify({
                        id: generateID(),
                        content: text,
                        admin: false,
                        name: "Customer",
                    }),
                ],
            }
        );
        if (result.$id) {
            successMessage("Message Sent!");
            // notify staff via notifications
        } else {
            errorMessage("Error! Try resending your message")
        }
    };
    
}