"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[822],{822:function(e,t,n){n.r(t),n.d(t,{default:function(){return x}});var a=n(5893),r=n(6076),i=n(5553),l=n(9485),s=n(7294),c=n(8392),o=n(5447),d=n(3680),h=n(5147),u=n(7160),j=n.n(u);function x(e){let[t,n]=(0,s.useState)(!1),[u,x]=(0,s.useState)([]),[w,p]=(0,s.useState)(null),[m,g]=(0,s.useState)(""),[v,k]=(0,s.useState)(""),[f,y]=(0,s.useState)(""),[b,N]=(0,s.useState)(""),[S,C]=(0,s.useState)(""),[Z,I]=(0,s.useState)(!1),[T,E]=(0,s.useState)(!1),_=async function(){let t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(t){let n=e.provider.getSigner();return new r.CH(c.I,c.d,n)}return new r.CH(c.I,c.d,e.provider)},A=async()=>{let e=await _(!0),t=await e.getTokenIds();for(var a=[],r=0;r<t.length;r++){var i=t[r].toNumber();if(0!=i){let l=await e.getTokenAttrs(t[r]);a.push({tokenId:i,product:l[3],quantity:l[2],unit:l[4],state:l[5]})}}x(a),n(!1)},L=async e=>{try{let t=await _();return await t.getState(Number(e))}catch(n){console.log(n),window.alert("There was an error when getting the state of the token")}},D=async e=>{try{let t=await _(!0),a=await t.accept(e);n(!0),await a.wait()}catch(r){console.log(r),window.alert("There was an error when accepting token")}},q=async e=>{try{let t=await _(!0),a=await t.reject(e);n(!0),await a.wait()}catch(r){console.log(r),window.alert("There was an error when accepting token")}},P=async()=>{try{let e=await _(!0),t=await e.mint(m,Date.now(),f,v,b);n(!0),await t.wait()}catch(a){console.log(a),window.alert("There was an error with the minting of the token")}},G=e=>{e.preventDefault(),P(),p(null),g(""),k(""),y(""),N("")},U=async()=>{try{let e=await _(!0),t=await e.putOnSale(m,i.fi(S));n(!0),await t.wait()}catch(a){console.log(a),window.alert("There was an error with the on sale")}},H=e=>{e.preventDefault(),U(),p(null),g(""),C("")},K=(e,t)=>{w==t?(p(null),g("")):(p(t),g(e),L(e).then(function(e){0==e?(I(!0),E(!1)):2==e?(I(!1),E(!0)):(I(!1),E(!1))}))},B=e=>{switch(e){case 0:return"New";case 1:return"Delivered";case 2:return"Accepted";case 3:return"Rejected"}};return(0,s.useEffect)(()=>{var t;let a=new r.CH(c.I,c.d,e.provider);return e.provider.send("eth_requestAccounts",[]).then(function(e){t=l.Kn(e[0])}),async function(){n(!0),await A()}(),a.on(a.filters.Transaction(t,null,[0,1,2,3,5]),async(e,t,a)=>{n(!0),await A()}),()=>{e.provider.removeAllListeners()}},[e]),(0,a.jsx)("div",{children:(0,a.jsxs)("div",{className:j().main,children:[(0,a.jsxs)("div",{className:j().title,children:[(0,a.jsx)("img",{width:100,height:100,src:"./bakerColor.png",alt:"baker icon"}),(0,a.jsx)("h2",{children:"Baker User Account"})]}),(0,a.jsxs)(h.Z,{striped:!0,bordered:!0,hover:!0,className:j().table,children:[(0,a.jsx)("thead",{children:(0,a.jsxs)("tr",{children:[(0,a.jsx)("th",{children:"Select"}),(0,a.jsx)("th",{children:"Token ID"}),(0,a.jsx)("th",{children:"Product Name"}),(0,a.jsx)("th",{children:"Quantity"}),(0,a.jsx)("th",{children:"Unit"}),(0,a.jsx)("th",{children:"State"})]})}),(0,a.jsx)("tbody",{children:t?(0,a.jsx)("tr",{children:(0,a.jsxs)("td",{style:{"--bs-table-accent-bg":"white",textAlign:"center"},colSpan:"6",children:[(0,a.jsx)("img",{src:"./loading.gif",alt:"loading..."}),(0,a.jsx)("p",{className:j().p_no_margin,children:"Loading, wait some seconds..."})]})}):u.map((e,t)=>(0,a.jsxs)("tr",{children:[(0,a.jsx)("td",{children:(0,a.jsx)(o.Z.Check,{type:"radio",id:e.tokenId,value:e.tokenId,name:"selectedToken",checked:w==t,readOnly:!0,onClick:e=>K(e.target.value,t)})}),(0,a.jsx)("td",{children:e.tokenId}),(0,a.jsx)("td",{children:e.product}),(0,a.jsx)("td",{children:e.quantity}),(0,a.jsx)("td",{children:e.unit}),(0,a.jsx)("td",{children:1==e.state?(0,a.jsxs)("div",{children:[(0,a.jsx)(d.Z,{className:j().validateButton,variant:"primary",value:e.tokenId,onClick:e=>D(e.target.value),children:"Accept"}),(0,a.jsx)(d.Z,{variant:"danger",value:e.tokenId,onClick:e=>q(e.target.value),children:"Reject"})]}):(0,a.jsx)("p",{className:j().p_no_margin,children:B(e.state)})})]},t))})]}),(0,a.jsxs)("div",{className:j().flexContainer,children:[(0,a.jsx)("div",{className:j().form,children:(0,a.jsxs)(o.Z,{onSubmit:G,children:[(0,a.jsx)("h4",{children:"Mint"}),""!=m&&T?(0,a.jsx)("p",{children:"Token selected for minting"}):(0,a.jsx)("p",{children:"Select an ACCEPTED token"}),(0,a.jsxs)(o.Z.Group,{className:"mb-3",controlId:"productName",children:[(0,a.jsx)(o.Z.Label,{children:"Product Name"}),(0,a.jsx)(o.Z.Control,{placeholder:"Enter name of product",value:v,onChange:e=>k(e.target.value)})]}),(0,a.jsxs)(o.Z.Group,{className:"mb-3",controlId:"quantity",children:[(0,a.jsx)(o.Z.Label,{children:"Quantity"}),(0,a.jsx)(o.Z.Control,{placeholder:"Enter quantity",value:f,onChange:e=>y(e.target.value)})]}),(0,a.jsx)(o.Z.Group,{className:"mb-3",controlId:"unit",children:(0,a.jsxs)(o.Z.Select,{value:b,onChange:e=>N(e.target.value),children:[(0,a.jsx)("option",{children:"Select unit"}),(0,a.jsx)("option",{value:"Kgs",children:"Kgs"}),(0,a.jsx)("option",{value:"L",children:"L"}),(0,a.jsx)("option",{value:"Unit",children:"Unit"})]})}),(0,a.jsx)(d.Z,{variant:"primary",type:"submit",disabled:""==v||""==f||""==b,children:"Mint"})]})}),(0,a.jsxs)("div",{className:j().form,children:[(0,a.jsx)("h4",{children:"Sell"}),""!=m&&Z?(0,a.jsx)("p",{children:"Token selected for sale"}):(0,a.jsx)("p",{children:"Select an NEW token"}),(0,a.jsxs)(o.Z,{onSubmit:H,children:[(0,a.jsxs)(o.Z.Group,{className:"mb-3",controlId:"productName",children:[(0,a.jsx)(o.Z.Label,{children:"Price"}),(0,a.jsx)(o.Z.Control,{placeholder:"Enter price of product",value:S,onChange:e=>C(e.target.value)})]}),(0,a.jsx)(d.Z,{variant:"primary",type:"submit",disabled:""==m||""==S||!Z,children:"Put on sale"})]})]})]})]})})}n(1535)}}]);