const nameE1=document.querySelector("#Name");
const email=document.querySelector("#Email");
const password=document.querySelector("#Password");
const subject=document.querySelector("#Subject");
const button=document.querySelector("#btn");

button.addEventListener("click",()=>{
    loginpage();
})
async function loginpage(){
  
  try {
    const rse =  await fetch("http://localhost:3000/api/auth/register",{
    method:"POST",
     headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "email":email.value, "password":password.value,"subject":subject.value,"name":nameE1.value})
   })
  console.log(rse);
   if(rse.ok){
     window.location.href="../desktoppage/desktop.html"
   }
  } catch (error) {
    
  }
}