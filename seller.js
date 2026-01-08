document.addEventListener('DOMContentLoaded', function() {
    const sellerNameDisplay = document.getElementById('sellerNameDisplay');
    const sellerProfileName = document.getElementById('sellerProfileName');
    const sellerAvatar = document.getElementById('sellerAvatar');
    const myItemsList = document.getElementById('myItemsList');
    const logoutBtn = document.getElementById('logoutBtn');
    const switchToBuyerBtn = document.getElementById('switchToBuyerBtn');
    const sellForm = document.getElementById('sellForm');
    const totalItemsForSale = document.getElementById('totalItemsForSale');
    const totalItemsSold = document.getElementById('totalItemsSold');
    const revenue = document.getElementById('revenue');
    const notification = document.getElementById('notification');
    const notificationContainer = document.getElementById('notificationContainer');

    // 从localStorage获取当前用户信息
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'seller') {
        window.location.href = 'index.html';
        return;
    }

    sellerNameDisplay.textContent = currentUser.name;
    sellerProfileName.textContent = currentUser.name;
    sellerAvatar.textContent = currentUser.name.charAt(0).toUpperCase();

    // 从localStorage获取商品数据
    let items = JSON.parse(localStorage.getItem('items')) || [];

    // 渲染我的商品列表（只显示当前卖家的商品）
    function renderMyItems() {
        const myItems = items.filter(item => item.seller === currentUser.name);
        myItemsList.innerHTML = '';

        if (myItems.length === 0) {
            // 如果没有商品，显示空状态
            myItemsList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📦</div>
                            <h3>暂无商品</h3>
                            <p>您还没有发布任何商品，快去发布第一个商品吧！</p>
                        </div>
                    `;
            totalItemsForSale.textContent = 0;
            return;
        }

        myItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';
            let badgeText = '在售';
            let badgeColor = '#6c5ce7';

            if (item.status === 'sold') {
                badgeText = '已售';
                badgeColor = '#e74c3c';
            } else if (item.status === 'completed') {
                badgeText = '已完成';
                badgeColor = '#2ecc71';
            }

            itemElement.innerHTML = `
                        <div class="item-badge" style="background-color: ${badgeColor}">${badgeText}</div>
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <div class="item-price">¥ ${item.price}</div>
                            <div class="item-meta">
                                <span class="item-time">${item.time}</span>
                                <span class="item-category">${item.category}</span>
                            </div>
                            <div class="item-actions">
                                <button class="action-btn edit-btn" data-id="${item.id}">编辑</button>
                                <button class="action-btn delete-btn" data-id="${item.id}">删除</button>
                            </div>
                            ${item.status === 'sold' ? `<button class="action-btn deliver-btn" data-id="${item.id}" data-buyer="${item.buyer}">发货</button>` : ''}
                        </div>
                    `;
            myItemsList.appendChild(itemElement);
        });

        // 为删除按钮添加事件监听
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteItem(id);
            });
        });

        // 为发货按钮添加事件监听
        document.querySelectorAll('.deliver-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const buyer = this.getAttribute('data-buyer');
                deliverItem(id, buyer);
            });
        });

        // 为编辑按钮添加事件监听
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editItem(id);
            });
        });

        updateStats();
    }

    // 更新统计信息
    function updateStats() {
        const myItems = items.filter(item => item.seller === currentUser.name);
        const soldItems = myItems.filter(item => item.status === 'sold' || item.status === 'completed');

        totalItemsForSale.textContent = myItems.filter(item => item.status === 'available').length;
        totalItemsSold.textContent = soldItems.length;

        // 计算总收入
        const totalRevenue = soldItems.reduce((sum, item) => {
            return sum + item.price;
        }, 0);

        revenue.textContent = `¥${totalRevenue.toFixed(2)}`;
    }

    renderMyItems();

    // 发布商品表单提交事件
    sellForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('itemName').value;
        const description = document.getElementById('itemDescription').value;
        const price = parseFloat(document.getElementById('itemPrice').value);
        const image = document.getElementById('itemImage').value || 'https://via.placeholder.com/320x220?text=No+Image';
        const category = document.getElementById('itemCategory').value;
        const condition = document.getElementById('itemCondition').value;

        const newItem = {
            id: Date.now(),
            name: name,
            description: description,
            price: price,
            image: image,
            seller: currentUser.name,
            time: new Date().toLocaleString(),
            category: category,
            condition: condition,
            status: 'available' // 新商品默认为可售状态
        };

        items.push(newItem);
        localStorage.setItem('items', JSON.stringify(items));

        // 重置表单
        sellForm.reset();

        // 提示用户
        showNotification('商品发布成功！', 'success');

        // 重新渲染我的商品列表
        renderMyItems();
    });

    // 删除商品函数
    function deleteItem(id) {
        if (confirm('确定要删除这个商品吗？')) {
            items = items.filter(item => item.id !== id);
            localStorage.setItem('items', JSON.stringify(items));
            renderMyItems();
            showNotification('商品删除成功', 'success');
        }
    }

    // 编辑商品函数
    function editItem(id) {
        const item = items.find(i => i.id === id);
        if (!item) {
            showNotification('商品不存在', 'error');
            return;
        }

        // 在这里可以实现编辑功能，这里只是示例
        alert(`编辑商品: ${item.name}\n\n当前功能尚未完全实现，实际应用中可以弹出编辑表单`);
    }

    // 发货函数
    function deliverItem(itemId, buyerName) {
        const item = items.find(i => i.id === itemId);
        if (!item) {
            showNotification('商品不存在', 'error');
            return;
        }

        // 更新商品状态为已发货
        item.status = 'shipping';
        localStorage.setItem('items', JSON.stringify(items));

        showNotification('正在发货...', 'success');

        // 5秒后发货成功
        setTimeout(() => {
            // 更新商品状态为已完成
            item.status = 'completed';
            localStorage.setItem('items', JSON.stringify(items));

            showNotification('发货成功！交易完成', 'success');

            // 通知买方已发货
            let deliveryNotifications = JSON.parse(localStorage.getItem('deliveryNotifications')) || [];
            deliveryNotifications.push({
                id: Date.now(),
                itemId: itemId,
                buyer: buyerName,
                message: `您的订单 "${item.name}" 已发货`,
                time: new Date().toLocaleString()
            });
            localStorage.setItem('deliveryNotifications', JSON.stringify(deliveryNotifications));

            // 重新渲染商品列表
            renderMyItems();
        }, 5000);
    }

    // 显示通知
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // 渲染通知列表（只显示与当前卖家相关的通知）
    function renderNotifications() {
        const notifications = JSON.parse(localStorage.getItem('sellerNotifications')) || [];
        const deliveryNotifications = JSON.parse(localStorage.getItem('deliveryNotifications')) || [];

        notificationContainer.innerHTML = `
                    <div class="notification-item hint">
                        <h4>提示</h4>
                        <p>这里显示您商品的购买和发货通知</p>
                        <div class="time">系统提示</div>
                    </div>
                `;

        // 过滤出与当前卖家相关的通知
        const myNotifications = notifications.filter(n => {
            // 查找通知中涉及的商品是否是当前卖家的商品
            const item = items.find(i => i.id === n.itemId);
            return item && item.seller === currentUser.name;
        });

        // 过滤出与当前卖家相关的发货通知
        const myDeliveryNotifications = deliveryNotifications.filter(n => {
            const item = items.find(i => i.id === n.itemId);
            return item && item.seller === currentUser.name;
        });

        // 合并所有通知并按时间排序
        const allMyNotifications = [...myNotifications, ...myDeliveryNotifications];
        allMyNotifications.sort((a, b) => b.time - a.time);

        if (allMyNotifications.length === 0) {
            return;
        }

        allMyNotifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification-item ' + (notification.itemId ? 'delivered' : 'sold');
            notificationElement.innerHTML = `
                        <h4>${notification.message}</h4>
                        <p>商品ID: ${notification.itemId || 'N/A'}</p>
                        <div class="time">${notification.time}</div>
                    `;
            notificationContainer.appendChild(notificationElement);
        });
    }

    // 登出按钮事件
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 切换到买方界面
    switchToBuyerBtn.addEventListener('click', function() {
        localStorage.setItem('currentUser', JSON.stringify({
            name: currentUser.name,
            type: 'buyer'
        }));
        window.location.href = 'buyer.html';
    });

    // 定期更新通知
    setInterval(() => {
        renderNotifications();
        renderMyItems();
    }, 1000);
});
