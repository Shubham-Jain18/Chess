document.addEventListener('DOMContentLoaded', (event) => {
    const playOptionButtons = document.querySelectorAll('.play-option');
    const playOptionsDiv = document.getElementById('play-options');
    const gameModesDiv = document.getElementById('game-options');
    const profileLink = document.getElementById('profile-link');
    const profileDetails = document.getElementById('profile');
    const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle");
    const backButton = document.getElementById('back-button');
    const playOptions = document.getElementById('play-options');
    const isAuthenticated = playOptions.getAttribute('data-authenticated') === "True";
    console.log(isAuthenticated);
    // Get the login alert element
    const loginAlert = document.getElementById('login-alert');


    // Function to show game modes and hide play options
    function showGameModes() {
        playOptionsDiv.classList.add('d-none');
        gameModesDiv.classList.remove('d-none');
        backButton.classList.remove('d-none');
    }
    // Function to show play options and hide game modes
    function showPlayOptions() {
        playOptionsDiv.classList.remove('d-none');
        gameModesDiv.classList.add('d-none');
        backButton.classList.add('d-none');
    }

    // Event listener for play mode buttons
    playOptionButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            if (!isAuthenticated) {
                event.preventDefault(); // Prevent default button action
                loginAlert.classList.remove('d-none'); // Show the login alert
            } else {
                showGameModes();
            }
        });
    });
    backButton.addEventListener('click', showPlayOptions);

    toggle.addEventListener("click" , () =>{
        sidebar.classList.toggle("close");
    })
    // Open chess game page when a game mode is selected
    const gameOptionButtons = document.querySelectorAll('.game-option');
    gameOptionButtons.forEach(button => {

        button.addEventListener('click', () => {
            console.log("button is getting clicked");
            window.location.href = '/chess_game/';
        });
    });







});
