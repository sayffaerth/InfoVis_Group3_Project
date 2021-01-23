var acc = document.getElementsByClassName("accordion");
var i;
var panelSelected;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
        panelSelected = this;
        openPanel();
    });
}

function openPanel() {
    for (i = 0; i < acc.length; i++) {
        if (acc[i] === panelSelected) {
            panelSelected.classList.toggle("active");
            let panel = panelSelected.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        } else {
            acc[i].classList.remove("active");
            acc[i].nextElementSibling.style.maxHeight = null;
        }
    }
}
