/* Phase 2 — production inquiry intelligence
   Demo-only: no external APIs or Movie Park systems are connected. */

(function(){
  var STORAGE_KEY='movieParkDemoV2';
  var ADMIN_TOKEN_KEY='movieParkAdminToken';
  function token(){try{return localStorage.getItem(ADMIN_TOKEN_KEY)||''}catch(e){return ''}}
  function logout(){localStorage.removeItem(ADMIN_TOKEN_KEY);go('/admin')}
  async function login(){var u=document.getElementById('adminUser').value,p=document.getElementById('adminPass').value;var r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});var d=await r.json();if(!r.ok){document.getElementById('adminError').textContent=d.error||'Login failed';return}localStorage.setItem(ADMIN_TOKEN_KEY,d.token);admin()}
  window.adminLogin=login; window.adminLogout=logout;

  function save(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step:S.step,a:S.a,msgs:S.msgs,brief:S.brief,inq:S.inq
      }));
    }catch(e){}
  }

  function load(){
    try{
      var raw=localStorage.getItem(STORAGE_KEY);
      if(!raw)return;
      var d=JSON.parse(raw);
      if(d.step!==undefined)S.step=d.step;
      if(d.a)S.a=d.a;
      if(d.msgs)S.msgs=d.msgs;
      if(d.brief)S.brief=d.brief;
      if(d.inq&&d.inq.length)S.inq=d.inq;
    }catch(e){}
  }

  function score(b){
    var score=0;
    if(b.client)score+=10;
    if(b.project)score+=15;
    if(b.location)score+=10;
    if(b.deliverables)score+=15;
    if(b.deadline)score+=15;
    if(b.budget && b.budget!=='Not decided yet')score+=20;
    if(b.references)score+=5;
    if(b.requirements)score+=10;
    return {
      score:score,
      status:score>=75?'QUALIFIED':score>=55?'REVIEW REQUIRED':'NEEDS DETAILS'
    };
  }

  window.makeBrief=function(){
    var b={
      client:S.a.brand||'Demo Client',
      project:S.a.projectType||'Commercial Film',
      location:S.a.location||'Location not specified',
      deliverables:S.a.deliverables||'Deliverables to confirm',
      deadline:S.a.deadline||'Timeline to confirm',
      budget:S.a.budget||'Not decided yet',
      references:S.a.references||'No references supplied',
      requirements:S.a.requirements||'No additional requirements supplied'
    };
    var q=score(b);
    b.score=q.score;
    b.status=q.status;
    S.brief=b;

    var record={
      id:Date.now(),
      client:b.client,
      project:b.project,
      location:b.location,
      budget:b.budget,
      status:q.status==='QUALIFIED'?'Qualified':q.status==='REVIEW REQUIRED'?'Review Required':'New',
      date:'Just now',
      score:q.score,
      assigned:'Unassigned'
    };
    S.inq.unshift(record);
    save();
    go('/brief');
  };

  window.admin=function(){
    if(!token()){
      el('<div class="shell"><div class="ey">Protected workspace</div><h2>Account Manager Login</h2><p class="sub">Admin access is required to view production inquiries.</p><div class="card" style="max-width:520px"><div class="label">Username</div><input id="adminUser" placeholder="Admin username"><div class="label" style="margin-top:16px">Password</div><input id="adminPass" type="password" placeholder="Admin password" onkeydown="if(event.key===\'Enter\')adminLogin()"><div id="adminError" style="color:#d88;margin-top:12px;font-size:12px"></div><div class="actions"><button class="btn" onclick="adminLogin()">Sign In →</button></div></div></div>');
      return;
    }
    fetch('/api/admin/inquiries',{headers:{Authorization:'Bearer '+token()}}).then(function(r){if(r.status===401){logout();return null}return r.json()}).then(function(data){
      if(!data)return;
      var list=Array.isArray(data)?data:(data.inquiries||data.items||[]);
      var rows='',counts={New:0,Qualified:0,'Review Required':0,Contacted:0};
      list.forEach(function(x){counts[x.status]=(counts[x.status]||0)+1;rows+='<tr class="click" onclick="go(\\'/admin/inquiries/'+x.id+'\\')"><td><b>'+(x.client||'—')+'</b></td><td>'+(x.project||'—')+'</td><td>'+(x.location||'—')+'</td><td>'+(x.budget||'—')+'</td><td><span class="badge">'+(x.status||'New')+'</span></td><td>'+(x.createdAt||x.date||'')+'</td></tr>';});
      el('<div class="shell"><div class="ey">Protected account manager workspace</div><div class="top"><div><h2>Production Inquiries</h2><p class="sub">Backend-persisted inquiry queue.</p></div><button class="btn alt" onclick="adminLogout()">Log Out</button></div><div class="stats"><div class="stat"><b>'+counts.New+'</b><span>New</span></div><div class="stat"><b>'+counts.Qualified+'</b><span>Qualified</span></div><div class="stat"><b>'+counts['Review Required']+'</b><span>In Review</span></div><div class="stat"><b>'+counts.Contacted+'</b><span>Contacted</span></div></div><div class="tableWrap"><table class="table"><thead><tr><th>Client</th><th>Project</th><th>Location</th><th>Budget</th><th>Status</th><th>Received</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>');
    });
  };

  window.detail=function(id){
    if(!token()){go('/admin');return}
    fetch('/api/admin/inquiries/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token()}}).then(function(r){if(r.status===401){logout();return null}return r.json()}).then(function(x){
      if(!x||x.error){go('/admin');return}
      var scoreText=x.score!==undefined?x.score+'/100':'Not scored';
      var p=x.payload||x;
      var b=p.brief||p;
      el('<div class="shell"><button class="back" onclick="go(\\'/admin\\')">← Back to Inquiries</button><div class="ey">Inquiry #'+x.id+'</div><h2>'+(b.client||'Inquiry')+'</h2><div class="card"><div class="detailGrid"><div><div class="label">Project</div><div class="value">'+(b.project||'—')+'</div><div class="label">Location</div><div class="value">'+(b.location||'—')+'</div><div class="label">Budget</div><div class="value">'+(b.budget||'—')+'</div><div class="label">Qualification</div><div class="value">'+scoreText+'</div><span class="badge">'+(x.status||'New')+'</span></div><div><div class="ey">AI Summary</div><p class="sub">This inquiry has been converted into structured production data for account-manager review.</p><div class="row"><span>Assigned To</span><b>'+(x.assigned_to||'Unassigned')+'</b></div><div class="actions"><button class="btn" onclick="assignInquiry(\\''+x.id+'\\')">Assign Account Manager</button><button class="btn alt" onclick="contactInquiry(\\''+x.id+'\\')">Mark as Contacted</button></div></div></div></div></div>');
    });
  };

  window.assignInquiry=function(id){
    fetch('/api/admin/inquiries/'+encodeURIComponent(id),{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({assignedTo:'Account Manager'})}).then(function(){detail(id)});
  };

  window.contactInquiry=function(id){
    fetch('/api/admin/inquiries/'+encodeURIComponent(id),{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({action:'contact'})}).then(function(){detail(id)});
  };

  var originalRender=window.render;
  window.render=function(){
    save();
    originalRender();
  };

  load();
  render();
})();