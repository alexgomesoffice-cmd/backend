// sends a hotel creation request and logs response
(async () => {
  try {
    const payload = {
      name: 'sad',
      city: 'Dhaka',
      address: 'asdasd',
      zip_code: '21321312',
      hotel_type: 'hotel',
      email: 'dsad@gmail.com',
      emergency_contact1: '12432123',
      emergency_contact2: '234234324',
      owner_name: '23123',
      manager_name: '2342341',
      manager_phone: '2312313',
      details: {
        reception_no1: '123123123234234234',
        reception_no2: '',
        star_rating: 5,
        description: 'dsadasd'
      },
      images: [],
      amenities: ['Free Wi-Fi','Gym / Fitness Center'],
      admin: {name:'adsd',email:'h1@gmail.com',password:'h123456',phone:'31234324123',nid_no:'123323'}
    };
    const res = await fetch('http://localhost:3000/api/hotels/create', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    console.log('status',res.status);
    const data = await res.text();
    console.log('data',data);
  } catch(e){
    console.error('err',e);
  }
})();