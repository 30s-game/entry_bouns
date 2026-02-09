document.getElementById('saveBtn').onclick = () => {
    const id = document.getElementById('targetId').value;
    const scroll = document.getElementById('scrollOn').checked;
    
    chrome.storage.local.set({ targetId: id, scrollOn: scroll }, () => {
        alert("설정 저장 완료");
    });
};

// 저장된 값 불러오기
chrome.storage.local.get(['targetId', 'scrollOn'], (data) => {
    if(data.targetId) document.getElementById('targetId').value = data.targetId;
    if(data.scrollOn) document.getElementById('scrollOn').checked = data.scrollOn;
});
