nav. js :


const navToggle = document.querySelector(".nav__nav-toggle");
const navMenu = document.querySelector(".nav__menu");
const navVisible = document.querySelector(".navVisible")
const navimg = document.querySelector(".nav__list")

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("navVisible");

  if (navMenu.classList.contains("navVisible")) {
    navToggle.setAttribute("aria-label", "Cerrar menu");
    navVisible.style.left= "0%";
    navimg.style.background= "black";
  } 
  else {
    navToggle.setAttribute("aria-label", "Abrir menu");
    navVisible.style.left= "100%";
    navimg.style.background= "transparent";
  }
});