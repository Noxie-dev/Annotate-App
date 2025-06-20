import{j as e}from"./radix-ui-Dm4GcI-M.js";import{b as d}from"./index-CeiQEl0I.js";import{B as a}from"./button-BU14-tcR.js";import{B as i}from"./badge-CzkljnjK.js";import{S as n}from"./separator-UVofwG_Y.js";import{S as x}from"./UserProfile-CR6JMFRa.js";import{W as h,aJ as g,aK as p,Y as y,aL as u,ab as f,aM as j,aN as b,ah as N}from"./utils-vendor-DzewcVAv.js";import"./react-vendor-BxpQIQ7B.js";import"./pdf-vendor-BQ5_-Qxz.js";import"./data-vendor-7zrJSdJt.js";import"./card-BRJUXXhw.js";import"./avatar-Dqh11rFN.js";import"./select-BvRLeJVF.js";import"./form-vendor-B0nP1T3w.js";import"./zod-CPQLszjv.js";import"./profile-vendor-CNRlCIDN.js";import"./input-B_Pc9ca6.js";import"./label--JKAZs82.js";import"./tabs-C8PfzfW2.js";const v=[{id:"select",name:"Select",icon:"MousePointer",type:"select"},{id:"highlight",name:"Highlight",icon:"Highlighter",type:"highlight",color:"#fbbf24"},{id:"text",name:"Text Comment",icon:"Type",type:"text",color:"#3b82f6"},{id:"draw",name:"Draw",icon:"Pen",type:"draw",color:"#ef4444",size:2},{id:"rectangle",name:"Rectangle",icon:"Square",type:"rectangle",color:"#8b5cf6"},{id:"circle",name:"Circle",icon:"Circle",type:"circle",color:"#10b981"},{id:"arrow",name:"Arrow",icon:"ArrowRight",type:"arrow",color:"#f59e0b"},{id:"eraser",name:"Eraser",icon:"Eraser",type:"eraser"}],w=["#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#10b981","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899"];function Q(){const{currentTool:t,setCurrentTool:r}=d(),c=s=>{const o={MousePointer:N,Highlighter:b,Type:j,Pen:f,Square:u,Circle:y,ArrowRight:p,Eraser:g}[s];return o?e.jsx(o,{className:"w-4 h-4"}):null},l=s=>{r({...t,color:s})},m=s=>{r({...t,size:s[0]})};return e.jsxs("div",{className:"p-4 space-y-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"text-sm font-medium text-gray-200 mb-3",children:"Annotation Tools"}),e.jsx("div",{className:"grid grid-cols-2 gap-2",children:v.map(s=>e.jsxs(a,{variant:t.id===s.id?"default":"ghost",size:"sm",onClick:()=>r(s),className:`flex items-center justify-start space-x-2 h-10 ${t.id===s.id?"bg-blue-600 text-white":"text-gray-400 hover:text-gray-200"}`,children:[c(s.icon),e.jsx("span",{className:"text-xs",children:s.name})]},s.id))})]}),e.jsx(n,{className:"bg-gray-700"}),t.type!=="select"&&t.type!=="eraser"&&e.jsxs("div",{children:[e.jsxs("h4",{className:"text-sm font-medium text-gray-200 mb-3 flex items-center",children:[e.jsx(h,{className:"w-4 h-4 mr-2"}),"Color"]}),e.jsx("div",{className:"grid grid-cols-7 gap-2",children:w.map(s=>e.jsx("button",{onClick:()=>l(s),className:`w-8 h-8 rounded-lg border-2 transition-all ${t.color===s?"border-white scale-110":"border-gray-600 hover:border-gray-400"}`,style:{backgroundColor:s}},s))})]}),(t.type==="draw"||t.type==="eraser")&&e.jsxs("div",{children:[e.jsxs("h4",{className:"text-sm font-medium text-gray-200 mb-3",children:["Brush Size: ",t.size||2,"px"]}),e.jsx(x,{value:[t.size||2],onValueChange:m,max:20,min:1,step:1,className:"w-full"}),e.jsx("div",{className:"flex justify-center mt-3",children:e.jsx("div",{className:"rounded-full",style:{width:`${(t.size||2)*2}px`,height:`${(t.size||2)*2}px`,backgroundColor:t.color||"#3b82f6"}})})]}),e.jsx(n,{className:"bg-gray-700"}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-sm font-medium text-gray-200 mb-3",children:"Quick Actions"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(a,{variant:"ghost",size:"sm",className:"w-full justify-start text-gray-400 hover:text-gray-200",children:"Clear All Annotations"}),e.jsx(a,{variant:"ghost",size:"sm",className:"w-full justify-start text-gray-400 hover:text-gray-200",children:"Export Annotations"}),e.jsx(a,{variant:"ghost",size:"sm",className:"w-full justify-start text-gray-400 hover:text-gray-200",children:"Import Annotations"})]})]}),e.jsx(n,{className:"bg-gray-700"}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-sm font-medium text-gray-200 mb-3",children:"Layers"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-400",children:"My Annotations"}),e.jsx(i,{variant:"secondary",className:"bg-blue-900/20 text-blue-400",children:"Active"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-400",children:"Team Annotations"}),e.jsx(i,{variant:"secondary",className:"bg-green-900/20 text-green-400",children:"Visible"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-400",children:"Comments"}),e.jsx(i,{variant:"secondary",className:"bg-purple-900/20 text-purple-400",children:"Visible"})]})]})]})]})}export{Q as ToolsPanel};
