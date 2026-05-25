document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggleAuth');
    const authTitle = document.getElementById('authTitle');
    const authText = document.getElementById('authText');
    const nameGroup = document.getElementById('nameGroup');
    const submitBtn = authForm.querySelector('.btn-auth');
    
    let isLogin = true;

    // Check URL params for signup
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'true') {
        toggleAuthMode();
    }

    toggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });

    function toggleAuthMode() {
        isLogin = !isLogin;
        if (isLogin) {
            authTitle.textContent = 'Welcome Back';
            nameGroup.style.display = 'none';
            submitBtn.textContent = 'Log In';
            authText.textContent = "Don't have an account?";
            toggleAuth.textContent = 'Sign up';
        } else {
            authTitle.textContent = 'Start Your Journey';
            nameGroup.style.display = 'block';
            submitBtn.textContent = 'Sign Up';
            authText.textContent = "Already have an account?";
            toggleAuth.textContent = 'Log in';
        }
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // This is where Supabase auth integration goes
        console.log('Auth attempt:', isLogin ? 'Login' : 'Signup');
        
        // Simulating successful login redirect
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
});