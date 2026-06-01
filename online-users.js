import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, onSnapshot, serverTimestamp, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const usersListEl = document.getElementById('usersList');
const panelEl = document.getElementById('onlineUsersPanel');
let currentUserUid = null;
let heartbeatInterval = null;
let unsubscribeUsers = null;

// Función para actualizar estado
async function setOnline(uid) {
    if (!uid) return;
    try {
        await setDoc(doc(db, 'users', uid), {
            isOnline: true,
            lastSeen: serverTimestamp()
        }, { merge: true });
        console.log("✅ Marcado como online:", uid);
    } catch (e) { 
        console.error("❌ Error online:", e); 
    }
}

async function setOffline(uid) {
    if (!uid) return;
    try {
        await setDoc(doc(db, 'users', uid), {
            isOnline: false,
            lastSeen: serverTimestamp()
        }, { merge: true });
        console.log("🔴 Marcado como offline:", uid);
    } catch (e) { 
        console.error("❌ Error offline:", e); 
    }
}

// Listener de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("🟢 Usuario autenticado:", user.uid);
        currentUserUid = user.uid;
        panelEl.classList.remove('hidden');
        
        // Marcar online
        await setOnline(user.uid);
        
        // Heartbeat cada 5 segundos
        heartbeatInterval = setInterval(() => {
            setOnline(user.uid);
        }, 5000);
        
        // Cancelar listener anterior si existe
        if (unsubscribeUsers) {
            unsubscribeUsers();
        }
        
        // Escuchar usuarios
        unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            if (!usersListEl) return;
            usersListEl.innerHTML = '';
            
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const uid = docSnap.id;
                
                // Solo mostrar otros usuarios online
                if (data.isOnline === true && data.username && uid !== currentUserUid) {
                    const li = document.createElement('li');
                    li.textContent = data.username;
                    usersListEl.appendChild(li);
                }
            });
            
            if (usersListEl.children.length === 0) {
                usersListEl.innerHTML = '<li style="color:#666;">Nadie más conectado</li>';
            }
        });
        
    } else {
        console.log("🔴 Cerrando sesión...");
        if (currentUserUid) {
            await setOffline(currentUserUid);
        }
        currentUserUid = null;
        panelEl.classList.add('hidden');
        clearInterval(heartbeatInterval);
        if (unsubscribeUsers) {
            unsubscribeUsers();
            unsubscribeUsers = null;
        }
        if (usersListEl) usersListEl.innerHTML = '';
    }
});

// Cerrar pestaña
window.addEventListener('beforeunload', () => {
    if (currentUserUid) {
        setOffline(currentUserUid);
    }
});
