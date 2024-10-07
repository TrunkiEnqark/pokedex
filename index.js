function updateMenuText() {
    // Lấy độ rộng của cửa sổ trình duyệt
    var screenWidth = window.innerWidth;

    // Lấy tất cả các thẻ <a> có class 'menu-item' trong menu
    var menuItems = document.querySelectorAll('.menu-item');

    if (menuItems.length > 0) {
        if (screenWidth <= 745) {
            // Khi màn hình nhỏ hơn 745px, thay đổi nội dung
            menuItems[0].textContent = "Data";
            menuItems[1].textContent = "Event";
            menuItems[2].textContent = "Support";
            menuItems[3].textContent = "Contact";
        } else {
            // Khi màn hình lớn hơn 745px, giữ nguyên nội dung ban đầu
            menuItems[0].textContent = "Pokemon data";
            menuItems[1].textContent = "Pokemon event";
            menuItems[2].textContent = "Support service";
            menuItems[3].textContent = "Contact headquarters";
        }
    }
}

// Gọi hàm updateMenuText khi thay đổi kích thước cửa sổ
window.addEventListener('resize', updateMenuText);

// Gọi hàm updateMenuText khi tải trang
window.addEventListener('load', updateMenuText);