// online-users.js - VERSIÓN CORREGIDA
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, onSnapshot, serverTimestamp, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const usersListEl = document.getElementById('usersList');
const panelEl = document.getElementById('onlineUsersPanel');
let currentUserUid = null;
let heartbeatInterval = null;
let unsubscribeUsers = null;

// Marcar como online (usa merge: true para NO borrar username/email)
async function updateStatus(uid, isOnline) {
    if (!uid) return;
    
    // 🔴 SOLO actualizar isOnline y lastSeen
    // NO tocar username
    await setDoc(doc(db, 'users', uid), {
        isOnline: isOnline,
        lastSeen: serverTimestamp()
    }, { merge: true });
}

// Marcar como offline
async function setOffline(uid) {
    if (!uid) return;
    try {
        await setDoc(doc(db, 'users', uid), {
            isOnline: false,
            lastSeen: serverTimestamp()
        }, { merge: true });
        console.log("🔴 Marcado como offline:", uid);
    } catch (e) { console.error(" Error offline:", e); }
}

// Listener principal de sesión
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('🟢 Usuario autenticado:', user.uid);
        currentUserUid = user.uid;
        panelEl.classList.remove('hidden');
        
        await setOnline(user.uid);
        startHeartbeat(user.uid);
        setupPresenceListeners(user.uid);
        startRealtimeListener();
    } else {
        console.log('🔴 CERRANDO SESIÓN...');
        if (currentUserUid) {
            console.log('⏳ Marcando offline a:', currentUserUid);
            await setOffline(currentUserUid);
            console.log('✅ Offline marcado');
        }
        
        currentUserUid = null;
        panelEl.classList.add('hidden');
        clearInterval(heartbeatInterval);
        if (unsubscribeUsers) {
            unsubscribeUsers();
            unsubscribeUsers = null;
        }
        if (usersListEl) usersListEl.innerHTML = '';
        console.log('🧹 Limpieza completada');
    }
});

// Latido cada 5 segundos (como pediste)
function startHeartbeat(uid) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        if (uid && document.visibilityState === 'visible') {
            setOnline(uid);
        }
    }, 5000);
}

// Detectar cierre brusco o pestaña en segundo plano
function setupPresenceListeners(uid) {
    window.addEventListener('beforeunload', () => setOffline(uid));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && currentUserUid) setOffline(currentUserUid);
        else if (!document.hidden && currentUserUid) setOnline(currentUserUid);
    });
}

// Escuchar cambios en tiempo real
function startRealtimeListener() {
    if (unsubscribeUsers) unsubscribeUsers();
    
    unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!usersListEl) return;
        usersListEl.innerHTML = '';
        let count = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const uid = docSnap.id;
            console.log('Usuario:', data.username, 'Online:', data.isOnline);
            
            // Filtro estricto: solo online, con username, y que no seas tú
            if (data.isOnline === true && data.username && uid !== currentUserUid) {
                const li = document.createElement('li');
                li.textContent = data.username;
                usersListEl.appendChild(li);
                count++;
            }
        });

        // Mensaje si no hay nadie más
        if (count === 0) {
            usersListEl.innerHTML = '<li style="color:#666; font-size:0.85rem;">Nadie más conectado</li>';
        }
    }, (error) => {
        console.error("❌ Error escuchando usuarios:", error);
        usersListEl.innerHTML = '<li style="color:red;">Error de conexión</li>';
    });
}