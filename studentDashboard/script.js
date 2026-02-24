const attendence=document.querySelector(".attendance-percent");
const dataE1=document.querySelectorAll(".date")
const mounthE1=document.querySelector(".mounth");
const calender=document.querySelector(".calender")
document.addEventListener("DOMContentLoaded",()=>{
    changeper();


}) 
async function changeper(){
    try {
        const res= await fetch("http://localhost:3000/api/student/studentDetails");
        const data=await res.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
    // const percent = (data.totalpresentdays*100)/30;
    // attendence.textContent=`${percent}`;
    
}
mounthE1.addEventListener("input",()=>{
    calender.innerHTML=`
    <div class="day-name">SUN</div>
  <div class="day-name">MON</div>
  <div class="day-name">TUE</div>
  <div class="day-name">WED</div>
  <div class="day-name">THU</div>
  <div class="day-name">FRI</div>
  <div class="day-name">SAT</div>`;
    let monval=mounthE1.value;
    const month=new Date(`${monval} 00:00:00`).getMonth();
    const year=new Date(`${monval} 00:00:00`).getFullYear();
    const data=new Date(year,month+1,0).getDate();
    const day=new Date(year,month,1).getDay();
    console.log(day);
    for(i=0;i<day;i++){
        let div=document.createElement("div");
        div.classList.add("hidden");
        div.classList.add("date");
        calender.appendChild(div);    
    }
    for(i=1;i<=data;i++){
         let div=document.createElement("div");
        div.innerHTML=i;
        div.classList.add("date");
        calender.appendChild(div);   
    }
})
