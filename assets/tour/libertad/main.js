document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sceneList = document.getElementById('sceneList');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sceneList.classList.toggle('open');
    });
    

});