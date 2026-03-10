// login as system admin and then create hotel using token
// Node 24+ provides global fetch so no external package is required

async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/system-admin/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email:'admin@myhotels.com', password:'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('login', loginData);
    if (!loginData.success) return;
    const token = loginData.data.token;

    const payload = {
      name:'repHotel', city:'Dhaka', address:'addr', zip_code:'123', hotel_type:'hotel',
      email:'x@x.com', emergency_contact1:'', emergency_contact2:'', owner_name:'', manager_name:'', manager_phone:'',
      details:{reception_no1:'',reception_no2:'',star_rating:5,description:''},
      images:[], amenities:[], admin:{name:'a',email:'a1@a.com',password:'p',phone:'',nid_no:''}
    };

    const res = await fetch('http://localhost:3000/api/hotels/create', {
      method:'POST', headers:{
        'Content-Type':'application/json',
        Authorization: `Bearer ${token}`
      }, body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('hotel create status', res.status, 'body', text);
  } catch(e){console.error(e);} }

run();