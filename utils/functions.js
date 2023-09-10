import { account, db, storage } from "./appwrite";
import { ID } from 'appwrite';
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

// emailTicket creation
const emailTicketCreation = (user, ticketID, email, date_created, titile) => {
    emailjs
        .send(
            process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
            process.env.NEXT_PUBLIC_TICKET_CREATION_ID,
            { user, ticketID, email, date_created, titile },
            process.env.NEXT_PUBLIC_EMAIL_API_KEY,
        )
        .then(
            (result) => {
                console.log(result);
            }, 
            (error) => {
                errorMessage(error.text);
            }
        );
}


// emailStaffMessage
const emailStaffMessage = (user, chatURL, email, access_code) => {
    emailjs
        .send(
            process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
            process.env.NEXT_PUBLIC_STAFF_MESSAGE_ID,
            { user, chatURL, email, access_code },
            process.env.NEXT_PUBLIC_EMAIL_API_KEY
        )
        .then(
            (result) => {
                console.log(result);
            },
            (error) => {
                errorMessage(error.text);
            }
        );
}

// function to parse json
export const parseJSON = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch (err) {
        console.error("Error parsing JSON:", err);
        return null;
    }
}

export const statusOptions = (value) => {
    const statuses = [
        { title: "Open", value: "open" },
        { title: "In Progress", value: "in-progress"},
        { title: "Completed", value: "completed"},
    ];

    const result = statuses.filter((item) => item.value !== value);
    const empty = { title: "Select", value: "select" };
    const updatedResult = [empty, ...result];

    return updatedResult;
}

// convert date time
export const convertDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    return dateTime.toLocaleString('en-US', options);
};


// success message
export const successMessage = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: light,
    });
};

// error message
export const errorMessage = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        // theme: light,
    })
};

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
export const logIn = async(email, setEmail, password, setPassword, router) => {
    try {
        // appwrite login method
        await account.createEmailSession(email, password);
        await checkUserFromList(email, router);
        setEmail("");
        setPassword("");
    } catch (err) {
        console.log(err);
        errorMessage("Invalid credentials ❌")
    }
};

// function to logout
export const logout = async (router) => {
    try {
        await account.deleteSession("current");
        router.push("/");
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
            // "64d5b1b0ced831562811", "64d5b1fc98e1cb608772",
            ID.unique(),
            { user_id: generateID(), name, password, email }
        );
        successMessage("User added successfully")
        console.log({ name, email, password})

    } catch (err) {
        if (err.response && err.response.status === 429) {
            // Rate limit exceeded, implement exponential backoff
            const delay = Math.pow(2, err.response.headers.get('Retry-After')) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            await addUser(name, email, password); // Retry the function
        } else {
            console.log("An error occurred:", err);
        }
    }
};

// export const addUser = async (name, email, password) => {
//     try {
//         // create a new account on Appwrite Auth
//         await account.create(generateID(), email, password, name);
        
//         await db.createDocument(
//             "64d5b1b0ced831562811", "64d5b1fc98e1cb608772",
//             ID.unique(),
//             { user_id: generateID(), name, email }
//         );
//         successMessage("User added successfully");
//     } catch (err) {
//         if (err.response && err.response.status === 429) {
//             // Rate limit exceeded, implement exponential backoff
//             const delay = Math.pow(2, err.response.headers.get('Retry-After')) * 1000;
//             await new Promise(resolve => setTimeout(resolve, delay));
//             await addUser(name, email, password); // Retry the function
//         } else {
//             console.log("An error occurred:", err);
//         }
//     }
// };


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
            id, {status}
        );
        successMessage("Status updated, refresh page")
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
            emailStaffMessage(
                document. name,
                "https://facebook.com",
                doc.email,
                doc.access_code
            )
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
            errorMessage("Error! Try resending your message");
        }
    };
    
};


// start message
export const startMessage = async (name, email, subject, message, attachment, setLoading) => {
    // try {
    //     const response = await db.createDocument(
    //         process.env.NEXT_PUBLIC_DB_ID,
    //         process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
    //         ID.unique(),
    //         {
    //             name,
    //             email,
    //             subject,
    //             content: message,
    //             status: "open",
    //             messages: [
    //                 JSON.stringify({
    //                     id: generateID(),
    //                     content: message,
    //                     admin: false,
    //                     name: 'Customer'
    //                 })
    //             ],
    //             attachment_url: file_url,
    //             access_code: generateID(),
    //         }
    //     );
    //     // email user who created the ticket
    //     emailTicketCreation(
    //         name, 
    //         response.$id,
    //         email,
    //         convertDateTime(response.$createdAt),
    //         subject,
    //     );
    //     newTicketStaff(name);
    //     setLoading(false);
    //     successMessage("Ticket Created");
    // } catch(err) {
    //     errorMessage("Encountered saving ticket")
    // };

    // if (attachment !== null) {
    //     try {
    //         const response = await storage.createFile(
    //             process.env.NEXT_PUBLIC_BUCKET_ID,
    //             ID.unique(),
    //             attachment
    //         );
    //         const file_url = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECT_ID}&mode=admin`;
    //         createTicket(file_url);
    //     } catch (err) {
    //         errorMessage("Error uploading the image")
    //     }
    // } else {
    //     // await createTicket();
    //     await alert('Done')
    // }
    console.log({name, email, subject, message, attachment, setLoading})
};



// notify staff 
const notifyStaff = async (username, status, title) => {
    try {
        await fetch("/api/notify", {
            method:"POST",
            body: JSON.stringify({
                username,
                status,
                title,
            }),
            headers: {
                Accept: "application/json",
                "Content": "application/json",
            }
        });
    } catch (err) {
        console.log(err);
    }
}

// new staff ticket
const newTicketStaff = async (username) => {
    try {
        await fetch("/api/new", {
            method:'POST',
            body: JSON.stringify({
                username,
            }),
            headers: {
                Accept: "application/json",
                "Content": "application/json"
            },
        });
    } catch (err) {
        console.log(err);
    }
}