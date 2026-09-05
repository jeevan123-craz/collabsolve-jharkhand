'use client';

// MOCK FIREBASE - LocalStorage Based
// This completely replaces Firebase for local hackathon demos

const MOCK_DELAY = 300; // ms

// --- Core ---
export const db = { isMockDb: true };
export const auth = { isMockAuth: true };
export const googleProvider = {};

const getDb = () => {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem('mock_db');
  return data ? JSON.parse(data) : {};
};

const saveDb = (data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mock_db', JSON.stringify(data));
  window.dispatchEvent(new Event('mock_db_changed'));
};

const genId = () => Math.random().toString(36).substring(2, 15);

// --- Auth ---
let currentUser: any = null;

export const onAuthStateChanged = (auth: any, callback: (user: any) => void) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mock_auth_user');
    if (saved) currentUser = JSON.parse(saved);
  }
  callback(currentUser);
  
  const listener = () => callback(currentUser);
  if (typeof window !== 'undefined') {
    window.addEventListener('mock_auth_changed', listener);
  }
  return () => {
    if (typeof window !== 'undefined') window.removeEventListener('mock_auth_changed', listener);
  };
};

export const signInWithPopup = async (authObj?: any, provider?: any, customUser?: any) => {
  const user = customUser || {
    uid: 'google_uid_' + Math.random().toString(36).substring(2, 9),
    displayName: 'Jeevan Kishore',
    email: 'jeevan.kishore@gmail.com',
    photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocISZ8a9uL12=s96-c',
    emailVerified: true,
  };
  currentUser = user;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_auth_user', JSON.stringify(user));
    window.dispatchEvent(new Event('mock_auth_changed'));
  }
  return { user };
};

export const signInAnonymously = async (a?: any) => {
  const user = {
    uid: 'guest_' + Math.random().toString(36).substring(2, 9),
    displayName: 'Guest Citizen',
    email: 'guest@collabsolve.jharkhand.gov.in',
    photoURL: null,
  };
  currentUser = user;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_auth_user', JSON.stringify(user));
    window.dispatchEvent(new Event('mock_auth_changed'));
  }
  return { user };
};

export const signOut = async (a?: any) => {
  currentUser = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_auth_user');
    window.dispatchEvent(new Event('mock_auth_changed'));
  }
};

export const setMockUser = (user: any) => {
  currentUser = user;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_auth_user', JSON.stringify(user));
    window.dispatchEvent(new Event('mock_auth_changed'));
  }
};


// --- Firestore ---
export const collection = (db: any, ...paths: string[]) => ({ type: 'collection', path: paths.join('/') });
export const doc = (db: any, ...paths: string[]) => {
  const fullPath = paths.join('/');
  const parts = fullPath.split('/');
  const id = parts.pop()!;
  return { type: 'doc', path: parts.join('/'), id };
};

export const query = (ref: any, ...constraints: any[]) => ({ ...ref, constraints });

export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
export const orderBy = (field: string, dir: string = 'asc') => ({ type: 'orderBy', field, dir });
export const limit = (n: number) => ({ type: 'limit', n });

export const serverTimestamp = () => Date.now();

export const addDoc = async (ref: any, data: any) => {
  const state = getDb();
  if (!state[ref.path]) state[ref.path] = {};
  const id = genId();
  
  // Resolve serverTimestamps
  const resolvedData = { ...data };
  for (const key in resolvedData) {
    if (resolvedData[key] && typeof resolvedData[key] === 'object' && resolvedData[key].isServerTimestamp) {
      resolvedData[key] = Date.now();
    }
  }

  state[ref.path][id] = { ...resolvedData, id, createdAt: Date.now() };
  saveDb(state);
  return { id };
};

export const setDoc = async (ref: any, data: any, options?: any) => {
  const state = getDb();
  if (!state[ref.path]) state[ref.path] = {};
  if (options?.merge) {
    state[ref.path][ref.id] = { ...state[ref.path][ref.id], ...data };
  } else {
    state[ref.path][ref.id] = { ...data, id: ref.id };
  }
  saveDb(state);
};

export const updateDoc = async (ref: any, data: any) => {
  const state = getDb();
  if (!state[ref.path] || !state[ref.path][ref.id]) throw new Error("Document not found");
  state[ref.path][ref.id] = { ...state[ref.path][ref.id], ...data };
  saveDb(state);
};

export const getDoc = async (ref: any) => {
  const state = getDb();
  const data = state[ref.path]?.[ref.id];
  return {
    exists: () => !!data,
    data: () => data,
    id: ref.id
  };
};

export type MockSnapshot = {
  docs: Array<{ id: string, data: () => any }>;
  data?: () => any;
  exists?: () => boolean;
  id?: string;
  size: number;
  forEach: (cb: (doc: any) => void) => void;
};

export const onSnapshot = (queryObj: any, callback: (snapshot: MockSnapshot) => void) => {
  const emit = () => {
    const state = getDb();
    
    if (queryObj.type === 'doc') {
      const data = state[queryObj.path]?.[queryObj.id];
      callback({
        docs: [],
        size: 0,
        forEach: () => {},
        exists: () => !!data,
        data: () => data,
        id: queryObj.id
      });
      return;
    }

    let items = Object.values(state[queryObj.path] || {});

    // Apply constraints
    if (queryObj.constraints) {
      for (const c of queryObj.constraints) {
        if (c.type === 'where') {
          items = items.filter((item: any) => {
            if (c.op === '==') return item[c.field] === c.value;
            if (c.op === 'array-contains') return item[c.field]?.includes(c.value);
            return true;
          });
        }
      }
      
      const orderC = queryObj.constraints.find((c: any) => c.type === 'orderBy');
      if (orderC) {
        items.sort((a: any, b: any) => {
          const vA = a[orderC.field] || 0;
          const vB = b[orderC.field] || 0;
          return orderC.dir === 'desc' ? (vB > vA ? 1 : -1) : (vA > vB ? 1 : -1);
        });
      }

      const limitC = queryObj.constraints.find((c: any) => c.type === 'limit');
      if (limitC) {
        items = items.slice(0, limitC.n);
      }
    }

    const docsArray = items.map((item: any) => ({
      id: item.id,
      data: () => item
    }));

    callback({
      docs: docsArray,
      size: docsArray.length,
      forEach: (cb: (doc: any) => void) => docsArray.forEach(cb)
    });
  };

  emit(); // Initial call
  
  if (typeof window !== 'undefined') {
    window.addEventListener('mock_db_changed', emit);
  }
  return () => {
    if (typeof window !== 'undefined') window.removeEventListener('mock_db_changed', emit);
  };
};

export const getDocs = async (queryObj: any): Promise<MockSnapshot> => {
  return new Promise((resolve) => {
    onSnapshot(queryObj, (snap) => resolve(snap));
  });
};

export type User = any;


