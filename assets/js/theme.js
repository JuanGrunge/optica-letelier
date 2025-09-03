export function initTheme(){
  const toggle=document.getElementById('darkModeToggle');
  if(!toggle) return;

  const saved=localStorage.getItem('theme');
  if(saved==='dark'){ document.body.classList.add('dark-mode'); toggle.checked=true; }

  toggle.addEventListener('change', (e)=>{
    if(e.target.checked){
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme','dark');
    }else{
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme','light');
    }
  });
}
