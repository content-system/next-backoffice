var sysTitle, sysBody, sysLoading, sysToast, sysAlert, sysMessageHeader, sysMessage, sysErrorDetail, sysErrorDetailText,
    sysYes, sysNo, sysErrorDetailCaret;

sysTitle = document.getElementById("sysTitle");
sysBody = document.getElementById("sysBody");
sysLoading = document.getElementById("sysLoading");
sysToast = document.getElementById("sysToast");
sysAlert = document.getElementById("sysAlert");
sysMessageHeader = document.getElementById("sysMessageHeader");
sysMessage = document.getElementById("sysMessage");
sysErrorDetail = document.getElementById("sysErrorDetail");
sysErrorDetailText = document.getElementById("sysErrorDetailText");

sysErrorDetailCaret = document.getElementById("sysErrorDetailCaret");

sysYes = document.getElementById("sysYes");
sysNo = document.getElementById("sysNo");
document.getElementById("sysNo").addEventListener("click", function(){
    sysAlert.style.display = 'none';
    if (window.fnoOnClick) {
        window.fnoOnClick();
    }
    const input = sysYes['activeElement'];
    if (input) {
        try {
            input.focus();
        } catch (err) { }
    }
    sysYes['activeElement'] = null;
});
document.getElementById("sysYes").addEventListener("click", function(){
    sysAlert.style.display = 'none';
    if (window.fyesOnClick) {
        window.fyesOnClick();
    }
    const input = sysYes['activeElement'];
    if (input) {
        try {
            input.focus();
        } catch (err) { }
    }
    sysYes['activeElement'] = null;
});
var yesOnClick = function () {
    console.log("yesss");
    
    
    sysAlert.style.display = 'none';
    if (window.fyesOnClick) {
        window.fyesOnClick();
    }
    const input = sysYes['activeElement'];
    if (input) {
        try {
            input.focus();
        } catch (err) { }
    }
    sysYes['activeElement'] = null;
};
var noOnClick = function () {
    sysAlert.style.display = 'none';
    if (window.fnoOnClick) {
        window.fnoOnClick();
    }
    const input = sysYes['activeElement'];
    if (input) {
        try {
            input.focus();
        } catch (err) { }
    }
    sysYes['activeElement'] = null;
};
var callCount = 0;