document.addEventListener('DOMContentLoaded', function() {
    const userTypeOptions = document.querySelectorAll('.user-type-option');
    const userTypeInput = document.getElementById('userType');

    userTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            userTypeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            userTypeInput.value = this.getAttribute('data-type');
        });
    });

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        if (!userType) {
            alert('请选择用户类型');
            return;
        }

        // 从localStorage获取用户数据
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // 验证用户凭据
        const user = users.find(u => u.username === username && u.password === password && u.type === userType);

        if (user) {
            // 登录成功，存储当前用户信息
            localStorage.setItem('currentUser', JSON.stringify({
                name: username,
                type: userType
            }));

            // 根据用户类型跳转到不同界面
            if(userType === 'buyer') {
                window.location.href = 'buyer.html';
            } else if(userType === 'seller') {
                window.location.href = 'seller.html';
            }
        } else {
            alert('用户名、密码或用户类型不正确');
        }
    });
});