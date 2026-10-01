/* Phase 2 — production inquiry intelligence
   Demo-only: no external APIs or Movie Park systems are connected. */

(function(){
  var STORAGE_KEY='movieParkDemoV2';

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
    var counts={New:0,Qualified:0,'Review Required':0,Contacted:0};
    var rows='';
    S.inq.forEach(function(x){
      counts[x.status]=(counts[x.status]||0)+1;
      rows+='<tr class="click" onclick="go(\'/admin/inquiries/'+x.id+'\')">'+
        '<td><b>'+x.client+'</b></td><td>'+x.project+'</td><td>'+x.location+'</td>'+
        '<td>'+x.budget+'</td><td><span class="badge">'+x.status+'</span></td><td>'+x.date+'</td></tr>';
    });
    el('<div class="shell"><div class="ey">Account manager workspace</div>'+
      '<h2>Production Inquiries</h2>'+
      '<p class="sub">Live demo queue with browser-persisted inquiry state. No external systems are connected.</p>'+
      '<div class="stats">'+
      '<div class="stat"><b>'+counts.New+'</b><span>New</span></div>'+
      '<div class="stat"><b>'+counts.Qualified+'</b><span>Qualified</span></div>'+
      '<div class="stat"><b>'+counts['Review Required']+'</b><span>In Review</span></div>'+
      '<div class="stat"><b>'+counts.Contacted+'</b><span>Contacted</span></div></div>'+
      '<div class="tableWrap"><table class="table"><thead><tr>'+
      '<th>Client</th><th>Project</th><th>Location</th><th>Budget</th><th>Status</th><th>Received</th>'+
      '</tr></thead><tbody>'+rows+'</tbody></table></div></div>');
  };

  window.detail=function(id){
    var x=S.inq[0];
    for(var i=0;i<S.inq.length;i++){
      if(String(S.inq[i].id)===String(id)){x=S.inq[i];break;}
    }
    if(!x){go('/admin');return;}

    var scoreText=x.score!==undefined?x.score+'/100':'Not scored';
    el('<div class="shell"><button class="back" onclick="go(\'/admin\')">← Back to Inquiries</button>'+
      '<div class="ey">Inquiry #'+x.id+'</div><h2>'+x.client+'</h2>'+
      '<div class="card"><div class="detailGrid"><div>'+
      '<div class="label">Project</div><div class="value">'+x.project+'</div>'+
      '<div class="label">Location</div><div class="value">'+x.location+'</div>'+
      '<div class="label">Budget</div><div class="value">'+x.budget+'</div>'+
      '<div class="label">Qualification</div><div class="value">'+scoreText+'</div>'+
      '<span class="badge">'+x.status+'</span></div>'+
      '<div><div class="ey">AI Summary</div>'+
      '<p class="sub">The inquiry has been converted into structured production data. The qualification score is based on the completeness of project type, location, deliverables, timeline, budget and creative requirements.</p>'+
      '<div class="row"><span>Assigned To</span><b>'+(x.assigned||'Unassigned')+'</b></div>'+
      '<div class="actions"><button class="btn" onclick="assignInquiry('+x.id+')">Assign Account Manager</button>'+
      '<button class="btn alt" onclick="contactInquiry('+x.id+')">Mark as Contacted</button></div></div></div>'+
      '<div class="conversation"><div class="ey">Conversation</div>'+
      '<div class="mini"><b>AI Assistant</b>Tell me what you’re looking to produce, and I’ll help turn your idea into a structured production brief.</div>'+
      '<div class="mini"><b>Client</b>We need a premium commercial campaign with a hero film and social cuts.</div>'+
      '<div class="mini"><b>AI Assistant</b>I’ve captured the scope and prepared the inquiry for production review.</div></div></div></div>');
  };

  window.assignInquiry=function(id){
    var x=S.inq.find(function(i){return String(i.id)===String(id);});
    if(x){x.status='Review Required';x.assigned='Account Manager';save();detail(id);}
  };

  window.contactInquiry=function(id){
    var x=S.inq.find(function(i){return String(i.id)===String(id);});
    if(x){x.status='Contacted';x.assigned='Account Manager';save();detail(id);}
  };

  var originalRender=window.render;
  window.render=function(){
    save();
    originalRender();
  };

  load();
  render();
})();