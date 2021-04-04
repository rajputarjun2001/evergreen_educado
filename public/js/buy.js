const plus = document.querySelector('.plus');
 const productInfo = document.querySelector('.product-info');

 plus.addEventListener('click',(e)=>{
 productInfo.classList.toggle('showmore');
 if(plus.innerText === '+')
 {
     plus.innerText = '-';
 }
 else{
     plus.innerText = '+';
 }
 })