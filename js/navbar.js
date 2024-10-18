function changeLogo() {
    const image = document.getElementById("LG");

    if (window.innerWidth <= 768) {
        image.src = "/img/Header/Header2.avif"; // Đường dẫn đúng cho ảnh trên điện thoại
        image.alt = "Logo-for-phone";
    } else {
        image.src = "/img/header.avif"; // Đường dẫn đúng cho ảnh trên máy tính
        image.alt = "Logo-for-pc";
    }
}

function changeContent() {
    const Data = document.getElementById("PD");
    const Event = document.getElementById("PE");
    const Feedback = document.getElementById("PF");

    if (window.innerWidth <= 1149)
    {
        Data.textContent="Data";
        Event.textContent="Event";
        Feedback.textContent="Feedback";
    }
    else
    {
        Data.textContent="Pokemon Data";
        Event.textContent="Pokemon Event";
        Feedback.textContent="Pokemon Feedback";
    }
}

// Gọi hàm khi kích thước trình duyệt thay đổi
window.addEventListener("resize", changeLogo);
window.addEventListener("resize", changeContent);

// Gọi hàm khi trang web load lần đầu
changeLogo();
changeContent();
