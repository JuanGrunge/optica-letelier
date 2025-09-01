// Toggle secciones
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelector("nav").classList.remove("active");
}

// Menú hamburguesa
document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("active");
});

// Simulación búsqueda paciente
function mostrarPaciente() {
  document.getElementById("resultado").style.display = "block";
}

// Lógica del switch de modo oscuro
const toggleSwitch = document.querySelector('#darkModeToggle');
const body = document.querySelector('body');

function switchTheme(e) {
  if (e.target.checked) {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
}

toggleSwitch.addEventListener('change', switchTheme, false);

const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  body.classList.add(currentTheme + '-mode');
  if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
  }
}
