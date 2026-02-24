const EmailE1=document.querySelector(".Email");
const PasswordE1=document.querySelector(".Password");
const loginBtn=document.querySelector("#login-btn");



loginBtn.addEventListener("click",(e)=>{
    checkpassword();
    loginwork();
})
async function loginwork(){
    
    // console.log("hello")
    try {
        const rse = await fetch("http://127.0.0.1:3000/api/auth/login", {
            method: "POST",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "email":EmailE1.value, "password":PasswordE1.value})
        })

        const data=await rse.json();
        console.log(data);

        if(data.user.role==="STUDENT"){
            window.location.href="../studentDashboard/index.html";
        }
        else if(data.user.role==="TEACHER"){
            window.location.href="../Taecherdashboard/desktoppage/desktop.html";
        }
    } catch (error) {
        console.log(error);
    }
     
}
function checkpassword(){

    if( PasswordE1.value.trim()==="" || EmailE1.value.trim()===""){

        alert("email or password should not be empty");
    }

}