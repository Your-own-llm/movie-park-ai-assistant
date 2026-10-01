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

  function aiEnabled(){return true}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function filledCount(){
    var keys=['brand','projectType','location','deliverables','deadline','budget','references','requirements'];
    return keys.filter(function(k){return S.a[k] && String(S.a[k]).trim()}).length;
  }

  window.assistant=function(){
    if(!S.msgs.length)S.msgs=[{w:'ai',t:'Hi. I’m the AI Production Assistant. Tell me what you’re looking to produce, and I’ll turn the conversation into a structured production brief.'}];
    var m='';
    for(var i=0;i<S.msgs.length;i++)m+='<div class="msg '+S.msgs[i].w+'"><small>'+(S.msgs[i].w==='ai'?'AI Assistant':'You')+'</small>'+esc(S.msgs[i].t)+'</div>';
    var composer='<input id="inp" placeholder="Describe your project, scope, timing, budget, or anything you know…" onkeydown="if(event.key===\'Enter\')answer(this.value)"><button class="btn" onclick="answer(document.getElementById(\'inp\').value)">Send</button>';
    var ready=filledCount()>=5?'<button class="btn alt" onclick="makeBrief()">Review Project Brief →</button>':'';
    el('<div class="shell"><div class="top"><div><div class="ey">AI Production Assistant</div><h2>Start a Project Brief</h2><div class="sub">Tell the assistant about the project naturally. It will extract the production requirements as you chat.</div></div><div class="tag">Concept Demo · AI Intake</div></div><div class="chat"><div><div class="messages">'+m+'</div><div class="quick">'+ready+'</div><div class="composer">'+composer+'</div></div><aside class="side"><h3>Project Brief</h3><div class="progress"><div class="p '+(S.a.brand?'done':'')+'"><span></span>Client / Brand</div><div class="p '+(S.a.projectType?'done':'')+'"><span></span>Project Type</div><div class="p '+(S.a.location?'done':'')+'"><span></span>Location</div><div class="p '+(S.a.deliverables?'done':'')+'"><span></span>Deliverables</div><div class="p '+(S.a.deadline?'done':'')+'"><span></span>Timeline</div><div class="p '+(S.a.budget?'done':'')+'"><span></span>Budget</div><div class="p '+(S.a.references?'done':'')+'"><span></span>References</div><div class="p '+(S.a.requirements?'done':'')+'"><span></span>Requirements</div></div><div class="note">AI intake is connected through the backend when an LLM provider is configured. No real Movie Park internal systems are connected.</div></aside></div></div>');
  }

  window.answer=async function(v){
    v=(v||'').trim();if(!v)return;
    S.msgs.push({w:'user',t:v});assistant();
    try{
      var response=await fetch('/api/ai/intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:{message:v,conversation:S.msgs.map(function(x){return x.w+': '+x.t}),currentBrief:S.a,sourceUrl:(v.match(/https?:\\/\\/[^\\s]+/)||[])[0]||null}})});
      var data=await response.json();
      if(response.ok && data.handoff && data.handoff.brief){
        var b=data.handoff.brief;
        var map={client:'brand',project:'projectType',location:'location',deliverables:'deliverables',deadline:'deadline',budget:'budget',references:'references',requirements:'requirements'};
        Object.keys(map).forEach(function(k){if(b[k])S.a[map[k]]=b[k]});
        if(data.assistantMessage)S.msgs.push({w:'ai',t:data.assistantMessage});
        else S.msgs.push({w:'ai',t:'I’ve updated the project brief. What important detail should we add next?'});
      }else if(data.assistantMessage){
        S.msgs.push({w:'ai',t:data.assistantMessage});
      }else{
        S.msgs.push({w:'ai',t:'I couldn’t reach the AI service, so I’m keeping your message in the demo conversation. You can continue or generate the brief.'});
      }
    }catch(e){
      console.warn('AI intake unavailable',e);
      S.msgs.push({w:'ai',t:'The AI service is not available right now. Your conversation is still saved locally.'});
    }
    save();assistant();
  };

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
    b.score=q.score;b.status=q.status;S.brief=b;
    save();go('/brief');
  };

  window.submitBrief=async function(){
    if(!S.brief) return;
    try{
      var response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:S.brief})});
      var saved=await response.json();
      if(saved.inquiryId)S.brief.inquiryId=saved.inquiryId;
    }catch(error){console.warn('Backend inquiry persistence unavailable; keeping local demo state.',error)}
    var b=S.brief;
    var record={id:b.inquiryId||Date.now(),client:b.client,project:b.project,location:b.location,budget:b.budget,status:b.status==='QUALIFIED'?'Qualified':b.status==='REVIEW REQUIRED'?'Review Required':'New',date:'Just now',score:b.score,assigned:'Unassigned'};
    S.inq.unshift(record);save();go('/admin');
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

  window.brief=function(){
    var b=S.brief||{};
    var status=b.status||'IN PROGRESS';
    el('<div class="shell"><button class="back" onclick="go(\'/assistant\')">← Back to Conversation</button><div class="top"><div><div class="ey">Project Brief · Review</div><h2>'+(b.project||'Project Brief')+'</h2><div class="sub">Review the information captured from your conversation. Nothing is sent to the account manager until you choose to proceed.</div></div><span class="status">'+status+'</span></div><div class="briefGrid"><div class="card"><div class="fields"><div class="field"><div class="label">Client</div><div class="value">'+(b.client||'—')+'</div></div><div class="field"><div class="label">Location</div><div class="value">'+(b.location||'—')+'</div></div><div class="field"><div class="label">Deliverables</div><div class="value">'+(b.deliverables||'—')+'</div></div><div class="field"><div class="label">Timeline</div><div class="value">'+(b.deadline||'—')+'</div></div><div class="field"><div class="label">Budget</div><div class="value">'+(b.budget||'—')+'</div></div><div class="field"><div class="label">Creative Direction</div><div class="value">'+(b.references||'—')+'</div></div></div><div style="margin-top:22px"><div class="label">Additional Requirements</div><p class="sub">'+(b.requirements||'—')+'</p></div><div class="actions"><button class="btn" onclick="submitBrief()">Send to Account Manager →</button><button class="btn alt" onclick="go(\'/assistant\')">Continue Conversation</button></div></div><aside class="card"><div class="ey">AI Analysis</div><div class="analysis"><div class="row"><span>Qualification</span><b>'+((b.score!==undefined)?b.score+'/100':'Not scored')+'</b></div><div class="row"><span>Status</span><b>'+status+'</b></div></div><div class="note">You can continue asking questions before sending this brief. The account manager receives it only after you choose “Send to Account Manager”.</div></aside></div></div>');
  };

  var originalRender=window.render;
  window.render=function(){
    save();
    originalRender();
  };

  load();
  render();
})();