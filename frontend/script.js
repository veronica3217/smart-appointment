let userDetails = {};

// ---------- LOGIN / REGISTER ----------
function showLogin() {
  document.getElementById('registerDiv').style.display = 'none';
  document.getElementById('loginDiv').style.display = 'block';
}

function showRegister() {
  document.getElementById('registerDiv').style.display = 'block';
  document.getElementById('loginDiv').style.display = 'none';
}

async function register() {
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  if(!username || !password) return alert("Enter username & password");

  try {
    const res = await fetch('http://localhost:3000/auth/register',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username, password, role:'user'})
    });
    const data = await res.json();
    alert(data.message);
    if(data.status==='success') showLogin();
  } catch(err){ console.error(err); alert('Server error'); }
}

async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const role = document.getElementById('role').value;

  if(!username || !password) return alert("Enter username & password");

  try {
    const res = await fetch('http://localhost:3000/auth/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username,password})
    });
    const data = await res.json();
    if(data.status==='success'){
      localStorage.setItem('userId', data.userId);
      alert(data.message);
      if(role==='admin') window.location.href='admin.html';
      else window.location.href='user.html';
    } else alert(data.message);
  } catch(err){ console.error(err); alert('Server error'); }
}

// ---------- USER SIDE ----------
async function loadDoctors(){
  const res = await fetch('http://localhost:3000/user/doctors');
  const data = await res.json();
  const sel = document.getElementById('doctor');
  sel.innerHTML = '';
  data.doctors.forEach(d=>sel.innerHTML += `<option value="${d}">${d}</option>`);
}

function saveUserDetails(){
  userDetails.name = document.getElementById('name').value;
  userDetails.age = document.getElementById('age').value;
  userDetails.gender = document.getElementById('gender').value;
  userDetails.phone = document.getElementById('phone').value;
  fetchSlots(document.getElementById('doctor').value);
}

async function fetchSlots(doctor){
  const res = await fetch(`http://localhost:3000/user/slots?doctor=${encodeURIComponent(doctor)}`);
  const data = await res.json();
  const div = document.getElementById('slots');
  div.innerHTML='';

  if(!data.slots || data.slots.length===0){
    div.innerHTML='No slots available';
    return;
  }

  data.slots.forEach(s=>{
    let color = s.booked?'red':'green';
    let btn = s.booked ? 'Booked' : `<button onclick="bookSlot('${s.slot}','${doctor}')">Book</button>`;
    div.innerHTML += `<div style="color:${color}">${new Date(s.slot).toLocaleString()} - ${btn}</div>`;
  });
}

async function bookSlot(slot, doctor){
  const userId = localStorage.getItem('userId');
  if(!userId) return alert('Login required');

  const formattedSlot = slot.replace('T',' ') + ':00';

  const res = await fetch('http://localhost:3000/user/book',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      userId,
      name:userDetails.name,
      age:userDetails.age,
      gender:userDetails.gender,
      phone:userDetails.phone,
      doctor,
      slot:formattedSlot
    })
  });
  const data = await res.json();
  if(data.status==='success'){
    localStorage.setItem('confirmation', JSON.stringify({
      name: userDetails.name,
      age: userDetails.age,
      gender: userDetails.gender,
      phone: userDetails.phone,
      doctor,
      slot: formattedSlot
    }));
    window.location.href = 'confirmation.html';
  } else {
    alert(data.message);
    fetchSlots(doctor);
  }
}

// ---------- ADMIN SIDE ----------
async function loadAdminDoctors() {
  const res = await fetch('http://localhost:3000/user/doctors');
  const data = await res.json();
  const sel = document.getElementById('doctorAdmin');
  sel.innerHTML = '';
  data.doctors.forEach(d => sel.innerHTML += `<option value="${d}">${d}</option>`);
}

async function addSlot() {
  const doctor = document.getElementById('doctorAdmin').value;
  const slotInput = document.getElementById('slotInput').value;
  const msgDiv = document.getElementById('msg');
  if (!doctor || !slotInput) return alert('Select doctor and slot');

  const slot = slotInput.replace('T', ' ') + ':00';

  try {
    const res = await fetch('http://localhost:3000/admin/addslot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor, slot })
    });

    const data = await res.json();
    msgDiv.innerText = data.message;
    msgDiv.style.color = data.status === 'success' ? 'green' : 'red';

    if (data.status === 'success') {
      document.getElementById('addAnotherBtn').style.display = 'inline-block';
      document.getElementById('addSlotBtn').disabled = true;
    }

  } catch (err) {
    console.error(err);
    msgDiv.innerText = 'Server error';
    msgDiv.style.color = 'red';
  }
}

async function loadAdminDashboard() {
  const res = await fetch('http://localhost:3000/admin/slots');
  const data = await res.json();
  const div = document.getElementById('adminSlotsDiv');
  div.innerHTML = '';

  if(data.slots.length === 0){
    div.innerHTML = '<p>No slots available.</p>';
    return;
  }

  data.slots.forEach(s => {
    const color = s.booked ? 'red' : 'green';
    div.innerHTML += `<div style="color:${color};">
      ${s.doctor} - ${new Date(s.slot).toLocaleString()} - ${s.booked ? 'Booked' : 'Available'}
    </div>`;
  });
}

function adminLogout() {
  localStorage.clear();
  window.location.href = 'index.html';
}


function resetSlotForm() {
  document.getElementById('slotInput').value = '';
  document.getElementById('addSlotBtn').disabled = false;
  document.getElementById('addAnotherBtn').style.display = 'none';
  document.getElementById('msg').innerText = '';
}
