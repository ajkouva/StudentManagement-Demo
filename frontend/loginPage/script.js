
const EmailE1=document.querySelector(".Email");
const PasswordE1=document.querySelector(".Password");
const loginBtn=document.querySelector("#login-btn");
const Email=EmailE1.value;
const Password=PasswordE1.value;

loginBtn.addEventListener("click",(e)=>{
    checkpassword();
    loginwork();
})
async function loginwork(){
    
    console.log("hello")
    try {
        const rse = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        const data = await rse.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
     
}
function checkpassword(){

    if(Email.trim()===""|| Password.trim()===""){

        alert("email or password should not be empty");
        return false;
    }
}