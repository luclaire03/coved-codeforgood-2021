const firebase = require('firebase-admin');
const { FieldValueContext } = require('twilio/lib/rest/autopilot/v1/assistant/fieldType/fieldValue');

const db = firebase.firestore();
db.settings({ ignoreUndefinedProperties: true });

const usersCollectionRef = db.collection('users');
const mentorsCollectionRef = db.collection('mentors');
const parentsCollectionRef = db.collection('parents');
const messageCollectionRef = db.collection('messages');

const MENTOR = 'MENTOR';
const PARENT = 'PARENT';

const getDoc = async (collection, uid) => {
  const obj = await db.collection(collection).doc(uid).get();
  if (obj.exists) {
    return obj.data();
  }

  throw new Error(`Unable to find '${uid}' in '${collection}' collection`);
};

// Validation Functions
const parseMentor = async (body) => {
  const mentor = {
    name: body.name,
    email: body.email,
    pronouns: body.pronouns,
    college: body.college,
    avatar: body.avatar,
    bio: body.bio,
    major: body.major,
    tags: body.tags,
    subjects: body.subjects,
    gradeLevels: body.gradeLevels,
    timzone: body.timezone,
  };

  // TODO: validate data

  return mentor;
};

const parseParent = async (body) => {
  const parent = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    pronouns: body.pronouns,
    avatar: body.avatar,
    timezone: body.timezone,
  };

  // TODO: validate data

  return parent;
};

const parseStudent = async (body) => {
  const student = {
    name: body.name,
    email: body.email,
    gradeLevel: body.gradeLevel,
    subjects: body.subjects,
  };

  // TODO: validate data

  return student;
};

// These are the three main methods to interact with the user schemas

const getUser = async (uid) => {
  const userDoc = await getDoc('users', uid);
  let user;
  if (userDoc.role === MENTOR) {
    user = await getDoc('mentors', uid);
  } else if (userDoc.role === PARENT) {
    user = await getDoc('parents', uid);
    const studentSnapshot = await parentsCollectionRef.doc(uid).collection('students').get();
    user.students = studentSnapshot.docs.map((s) => s.data());
  }

  user.role = userDoc.role;

  return user;
};

const createUser = async (uid, body) => {
  const user = {
    role: body.role,
  };

  const batch = db.batch();
  batch.set(usersCollectionRef.doc(uid), user);

  if (user.role === MENTOR) {
    const mentor = await parseMentor(body);
    batch.set(mentorsCollectionRef.doc(uid), mentor);
  } else if (user.role === PARENT) {
    const parent = await parseParent(body);
    batch.set(parentsCollectionRef.doc(uid), parent);

    body.students.forEach(async (student) => {
      const newStudent = await parseStudent(student);
      const newStudentRef = parentsCollectionRef.doc(uid).collection('students').doc();
      batch.set(newStudentRef, newStudent);
    });
  } else {
    throw new Error(`Unexpected role: ${body.role}`);
  }

  return batch.commit();
};

const addMessageToDB = async (mentorUID, parentUID, studentUID, message) => {
  if (!mentorUID) throw new Error('mentorUID not provided.');
  if (!parentUID) throw new Error('parentUID not provided.');
  if (!studentUID) throw new Error('studentUID not provided.');
  if (!message) throw new Error('message not provided.');

  const newMessage = {
    mentorUID, parentUID, studentUID, message,
  };
  const newMessageRef = await messageCollectionRef.add(newMessage);
  return mentorsCollectionRef.doc(mentorUID).update({
    requests: FieldValue.arrayUnion(newMessageRef.id);
  });
};

module.exports = { getUser, createUser, addMessageToDB };
