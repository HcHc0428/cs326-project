import PouchDB from 'pouchdb';
import pouchdbFind from 'pouchdb-find';

PouchDB.plugin(pouchdbFind);

const db = new PouchDB('users');

// save data to the db
export async function saveUser(preferredName, username, password, email, major, academicYear, location, interests) {
  try {
    const user = {
      _id: email,  
      preferredName,
      username,
      password,
      email,
      major,
      academicYear,
      location,
      interests,
      subscriptions: [],
      availability: []
    };
    await db.put(user);
    return user;
  } catch (err) {
    console.error('Error saving user:', err);
    throw err;
  }
}

// load the user 
export async function loadUser(email) {
  try {
    const user = await db.get(email);
    return user;
  } catch (err) {
    console.error('Error loading user:', err);
    throw err;
  }
}

// update user
export async function updateUser(user) {
  try {
    await db.put(user);
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
}

// delete user
export async function deleteUser(email) {
  try {
    const user = await db.get(email);
    await db.remove(user);
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
}

// find user from email
export async function findUserByEmail(email) {
  try {
    const result = await db.find({ selector: { email } });
    return result.docs[0];
  } catch (err) {
    console.error('Error finding user by email:', err);
    throw err;
  }
}
