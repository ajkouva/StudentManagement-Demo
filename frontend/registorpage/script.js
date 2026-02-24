

const email=document.getElementById("email");
const password=document.getElementById("password");
const username=document.getElementById("username");
const subject=document.getElementById("subject");
const submit=document.getElementById("submit");



submit.addEventListener('click',()=>{
    check();
    datafetch();
})
function check(){
    if(password.value.trim()==""||email.value.trim()==""||username.value.trim()==""||subject.value.trim()==""){
        window.alert("The details is empty!");
        return false;
}
return true;

}
 async function datafetch(){
    try{
        const responce=await fetch("http://localhost:3000/api/auth/register",{
          method:"POST",
           headers: { "Content-Type": "application/json"}, 
           body:JSON.stringify({"email":email.value,
            "password":password.value,
            "name":username.value,
            "subject":subject.value}) 
        });
       console.log(responce);
        if(responce.ok){
            window.location.href="../loginPage/index.html"
        }
        else if(!responce.ok){
            window.alert("The details is invalid!!💀");
        }
    }
    catch(error){
        console.log(error);
    }
}
