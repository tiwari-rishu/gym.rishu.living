document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navUl.classList.toggle('active');
            // Toggle icon between bars and times
            const icon = mobileMenuBtn.querySelector('i');
            if (navUl.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenuBtn && navUl && !mobileMenuBtn.contains(e.target) && !navUl.contains(e.target) && navUl.classList.contains('active')) {
            navUl.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Smooth scrolling for anchor links (if any)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    /* --- ADMIN PANEL & BLOG LOGIC --- */

    // Mock Credentials
    const ADMIN_USER = "admin";
    const ADMIN_PASS = "password123";

    // Selectors
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const logoutBtn = document.getElementById('logoutBtn');
    const createPostForm = document.getElementById('createPostForm');
    const adminPostsList = document.getElementById('adminPostsList');
    const blogGrid = document.querySelector('.blog-grid'); // We need to add this class to blog.html

    // Check if we are on the admin page
    if (loginForm) {
        // Check if already logged in
        if (localStorage.getItem('isAdminLoggedIn') === 'true') {
            showDashboard();
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === ADMIN_USER && password === ADMIN_PASS) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                showDashboard();
            } else {
                document.getElementById('loginError').style.display = 'block';
            }
        });

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isAdminLoggedIn');
            location.reload();
        });

        createPostForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('postTitle').value;
            const category = document.getElementById('postCategory').value;
            const image = document.getElementById('postImage').value;
            const content = document.getElementById('postContent').value;

            const newPost = {
                id: Date.now(),
                title,
                category,
                image,
                content,
                date: new Date().toLocaleDateString()
            };

            savePost(newPost);
            createPostForm.reset();
            renderAdminPosts();
            alert('Post published successfully!');
        });
    }

    // Functions
    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        renderAdminPosts();
    }

    function savePost(post) {
        let posts = JSON.parse(localStorage.getItem('gymBlogPosts')) || [];
        posts.unshift(post); // Add new post to the beginning
        localStorage.setItem('gymBlogPosts', JSON.stringify(posts));
    }

    function getPosts() {
        return JSON.parse(localStorage.getItem('gymBlogPosts')) || [];
    }

    function deletePost(id) {
        if (confirm('Are you sure you want to delete this post?')) {
            let posts = getPosts();
            posts = posts.filter(post => post.id !== id);
            localStorage.setItem('gymBlogPosts', JSON.stringify(posts));
            renderAdminPosts();
            // If on blog page, re-render there too (though this function is mainly for admin panel)
        }
    }

    // Make deletePost global so onclick works
    window.deletePost = deletePost;

    function renderAdminPosts() {
        if (!adminPostsList) return;
        const posts = getPosts();
        adminPostsList.innerHTML = '';

        if (posts.length === 0) {
            adminPostsList.innerHTML = '<p style="color: #ccc;">No posts yet.</p>';
            return;
        }

        posts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'admin-post-item';
            postEl.innerHTML = `
                <div class="admin-post-info">
                    <h4>${post.title}</h4>
                    <span style="color: #888; font-size: 0.9rem;">${post.date} | ${post.category}</span>
                </div>
                <div class="admin-post-actions">
                    <button class="btn-delete" onclick="deletePost(${post.id})">Delete</button>
                </div>
            `;
            adminPostsList.appendChild(postEl);
        });
    }

    // Render posts on the actual Blog Page
    if (document.querySelector('title').innerText.includes('Blog')) {
        const blogContainer = document.querySelector('.blog-grid'); // We will add this class to the grid container
        if (blogContainer) {
            const posts = getPosts();

            // We can keep the static posts or clear them. Let's prepend dynamic posts.
            // Or better, let's just append them to the top if we want to keep static ones as "featured".
            // For this task, let's render dynamic posts at the top.

            posts.forEach(post => {
                const postHTML = `
                <div style="background: #1c1c1e; border-radius: 10px; overflow: hidden;">
                    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 1.5rem;">
                        <span style="color: var(--primary-color); font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">${post.category}</span>
                        <h3 style="font-size: 1.2rem; margin: 0.5rem 0;">${post.title}</h3>
                        <p style="font-size: 0.9rem; color: #ccc; margin-bottom: 1rem;">${post.content.substring(0, 100)}...</p>
                        <a href="#" style="color: var(--primary-color); font-weight: bold;">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
                `;
                blogContainer.insertAdjacentHTML('afterbegin', postHTML);
            });
        }
    }

    /* --- REGISTRATION FORM LOGIC --- */
    const registrationForm = document.querySelector('.registration-form');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalX = document.querySelector('.close-modal');

    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            // 1. Gather Data using FormData
            const formData = new FormData(registrationForm);

            // 2. Send Data to FormSubmit.co via AJAX
            fetch('https://formsubmit.co/ajax/rishukumartiwari789@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            })
                .then(response => response.json())
                .then(data => {
                    // 3. Show Success Modal
                    successModal.style.display = 'flex';
                    registrationForm.reset();
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Something went wrong. Please try again.');
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Close Modal Logic
    if (successModal) {
        closeModalBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
        });

        closeModalX.addEventListener('click', () => {
            successModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target == successModal) {
                successModal.style.display = 'none';
            }
        });
    }

});
