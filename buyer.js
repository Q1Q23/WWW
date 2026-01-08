document.addEventListener('DOMContentLoaded', function() {
    const buyerNameDisplay = document.getElementById('buyerNameDisplay');
    const buyerProfileName = document.getElementById('buyerProfileName');
    const buyerAvatar = document.getElementById('buyerAvatar');
    const itemList = document.getElementById('itemList');
    const purchasedItemsList = document.getElementById('purchasedItemsList');
    const logoutBtn = document.getElementById('logoutBtn');
    const switchToSellerBtn = document.getElementById('switchToSellerBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const totalItems = document.getElementById('totalItems');
    const purchasedItemsCount = document.getElementById('purchasedItems');
    const notification = document.getElementById('notification');
    const transactionStatus = document.getElementById('transactionStatus');
    const transactionMessage = document.getElementById('transactionMessage');

    // 从localStorage获取当前用户信息
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'buyer') {
        window.location.href = 'index.html';
        return;
    }

    buyerNameDisplay.textContent = currentUser.name;
    buyerProfileName.textContent = currentUser.name;
    buyerAvatar.textContent = currentUser.name.charAt(0).toUpperCase();

    // 从localStorage获取商品数据
    let items = JSON.parse(localStorage.getItem('items')) || [];

    // 渲染商品列表（只显示未售出的商品，排除当前用户已购买的商品）
    function renderItems(itemsToRender) {
        itemList.innerHTML = '';

        // 过滤掉已售出或已完成的商品，以及当前用户自己购买的商品
        const availableItems = itemsToRender.filter(item =>
            (!item.status || item.status === 'available') &&
            item.buyer !== currentUser.name
        );

        if (availableItems.length === 0) {
            // 如果没有商品，显示空状态
            itemList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">🔍</div>
                            <h3>暂无商品</h3>
                            <p>当前没有可购买的商品，请稍后再来查看</p>
                        </div>
                    `;
            totalItems.textContent = 0;
            return;
        }

        availableItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';
            itemElement.innerHTML = `
                        <div class="item-badge">🔥 热销</div>
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <div class="item-price">¥ ${item.price}</div>
                            <div class="item-meta">
                                <span class="item-seller">卖家: ${item.seller}</span>
                                <span class="item-time">${item.time}</span>
                            </div>
                            <button class="buy-btn" data-id="${item.id}">立即购买</button>
                        </div>
                    `;
            itemList.appendChild(itemElement);
        });
        totalItems.textContent = availableItems.length;

        // 为购买按钮添加事件监听
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                buyItem(itemId);
            });
        });
    }

    // 渲染已购买商品列表（只显示当前用户购买的商品）
    function renderPurchasedItems() {
        const purchasedItems = items.filter(item =>
            item.buyer === currentUser.name
        );

        purchasedItemsList.innerHTML = '';

        if (purchasedItems.length === 0) {
            // 如果没有已购买商品，显示空状态
            purchasedItemsList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📦</div>
                            <h3>暂无购买记录</h3>
                            <p>您还没有购买任何商品，快去购买心仪的商品吧！</p>
                        </div>
                    `;
            purchasedItemsCount.textContent = 0;
            return;
        }

        purchasedItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';
            let badgeText = '交易中';
            let badgeColor = '#3498db';

            if (item.status === 'completed') {
                badgeText = '已完成';
                badgeColor = '#2ecc71';
            } else if (item.status === 'sold') {
                badgeText = '待发货';
                badgeColor = '#e74c3c';
            }

            itemElement.innerHTML = `
                        <div class="item-badge" style="background-color: ${badgeColor}">${badgeText}</div>
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <div class="item-info">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <div class="item-price">¥ ${item.price}</div>
                            <div class="item-meta">
                                <span class="item-seller">卖家: ${item.seller}</span>
                                <span class="item-time">${item.time}</span>
                            </div>
                        </div>
                    `;
            purchasedItemsList.appendChild(itemElement);
        });

        purchasedItemsCount.textContent = purchasedItems.length;
    }

    // 初始化渲染
    renderItems(items);
    renderPurchasedItems();

    // 购买商品函数
    function buyItem(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) {
            showNotification('商品不存在', 'error');
            return;
        }

        // 检查商品是否已被购买
        if (item.status && item.status === 'sold') {
            showNotification('商品已被购买', 'error');
            return;
        }

        // 更新商品状态为已购买
        item.status = 'sold';
        item.buyer = currentUser.name;
        localStorage.setItem('items', JSON.stringify(items));

        // 显示交易状态
        transactionStatus.style.display = 'block';
        transactionMessage.textContent = `已购买 ${item.name}，等待卖家发货...`;

        // 通知卖家发货
        const sellers = JSON.parse(localStorage.getItem('users')) || [];
        const seller = sellers.find(u => u.username === item.seller && u.type === 'seller');

        if (seller) {
            // 保存通知给卖家
            let sellerNotifications = JSON.parse(localStorage.getItem('sellerNotifications')) || [];
            sellerNotifications.push({
                id: Date.now(),
                message: `买家 ${currentUser.name} 购买了您的商品 "${item.name}"，请尽快发货`,
                time: new Date().toLocaleString(),
                itemId: item.id,
                buyer: currentUser.name
            });
            localStorage.setItem('sellerNotifications', JSON.stringify(sellerNotifications));
        }

        showNotification('购买成功，等待卖家发货', 'success');

        // 重新渲染商品列表
        renderItems(items);
        renderPurchasedItems();
    }

    // 显示通知
    function showNotification(message, type) {
        notification.textContent = message;
        notification.style.backgroundColor = type === 'success' ? '#388e3c' : '#e74c3c';
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // 检查交易状态
    function checkTransactionStatus() {
        const activeItems = items.filter(item =>
            item.status === 'sold' &&
            item.buyer === currentUser.name
        );

        if (activeItems.length > 0) {
            transactionStatus.style.display = 'block';
            transactionMessage.textContent = `等待卖家发货...`;
        }
    }

    // 检查是否有发货通知
    function checkDeliveryNotifications() {
        const notifications = JSON.parse(localStorage.getItem('deliveryNotifications')) || [];
        const myNotifications = notifications.filter(n => n.buyer === currentUser.name);

        if (myNotifications.length > 0) {
            transactionMessage.textContent = `卖家已发货，快递正在路上...`;

            // 5秒后完成交易
            setTimeout(() => {
                myNotifications.forEach(notification => {
                    // 标记交易完成
                    const item = items.find(i => i.id === notification.itemId);
                    if (item) {
                        item.status = 'completed';
                        localStorage.setItem('items', JSON.stringify(items));
                    }
                });

                // 移除已处理的通知
                const remainingNotifications = notifications.filter(n => n.buyer !== currentUser.name);
                localStorage.setItem('deliveryNotifications', JSON.stringify(remainingNotifications));

                transactionMessage.textContent = '交易已完成！';

                // 重新渲染商品列表和已购买商品列表
                renderItems(items);
                renderPurchasedItems();

                showNotification('交易完成', 'success');
            }, 5000);
        }
    }

    // 搜索功能
    function searchItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = items.filter(item =>
            (item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)) &&
            (!item.status || item.status === 'available') &&
            item.buyer !== currentUser.name
        );
        renderItems(filteredItems);
    }

    searchBtn.addEventListener('click', searchItems);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchItems();
        }
    });

    // 登出按钮事件
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 切换到卖方界面
    switchToSellerBtn.addEventListener('click', function() {
        localStorage.setItem('currentUser', JSON.stringify({
            name: currentUser.name,
            type: 'seller'
        }));
        window.location.href = 'seller.html';
    });

    // 定期检查交易状态和发货通知
    setInterval(() => {
        checkTransactionStatus();
        checkDeliveryNotifications();
    }, 1000);
});