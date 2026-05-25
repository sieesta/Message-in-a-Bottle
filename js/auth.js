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

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = authForm.querySelector('.btn-auth');
        
        // Disable button while processing
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        
        try {
            if (isLogin) {
                // Execute actual Supabase Login
                const { data, error } = await loginUser(email, password);
                
                if (error) {
                    alert('Login Failed: ' + error.message);
                } else if (data.session) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                // Execute actual Supabase Signup
                const username = document.getElementById('username').value;
                const { data, error } = await signUpUser(email, password, username);
                
                if (error) {
                    alert('Signup Failed: ' + error.message);
                } else {
                    alert('Signup successful! Check your email to confirm, or you can log in directly if auto-confirmation is on.');
                    toggleAuthMode(); // Switch back to login
                }
            }
        } catch (err) {
            alert('An unexpected error occurred.');
            console.error(err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});