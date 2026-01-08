document.addEventListener('DOMContentLoaded', function() {
    const userTypeOptions = document.querySelectorAll('.user-type-option');
    const userTypeInput = document.getElementById('regUserType');
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    const strengthBar = document.getElementById('strengthBar');

    userTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            userTypeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            userTypeInput.value = this.getAttribute('data-type');
        });
    });

    // 密码强度检测
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        let width = 0;
        let className = '';

        if (strength <= 2) {
            width = 33;
            className = 'strength-weak';
        } else if (strength <= 3) {
            width = 66;
            className = 'strength-medium';
        } else {
            width = 100;
            className = 'strength-strong';
        }

        strengthBar.style.width = width + '%';
        strengthBar.className = 'strength-bar ' + className;
    });

    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const userType = document.getElementById('regUserType').value;

        if (!userType) {
            alert('请选择用户类型');
            return;
        }

        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        if (password.length < 6) {
            alert('密码长度至少为6位');
            return;
        }

        // 模拟注册逻辑，将用户信息存储在localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // 检查用户名是否已存在
        const userExists = users.some(user => user.username === username);
        if (userExists) {
            alert('用户名已存在');
            return;
        }

        // 检查邮箱是否已存在
        const emailExists = users.some(user => user.email === email);
        if (emailExists) {
            alert('邮箱已被注册');
            return;
        }

        // 添加新用户
        users.push({
            username: username,
            email: email,
            password: password, // 实际项目中应加密存储
            type: userType
        });

        localStorage.setItem('users', JSON.stringify(users));

        // 提示注册成功
        alert('注册成功！请登录');

        // 跳转到登录页面
        window.location.href = 'index.html';
    });
});