(function() {
    let lastWheelTime = 0;
    let isRightClick = false;

    // 우클릭 상태 감지
    window.addEventListener('mousedown', (e) => { if (e.button === 2) isRightClick = true; });
    window.addEventListener('mouseup', (e) => { if (e.button === 2) isRightClick = false; });
    window.addEventListener('contextmenu', (e) => {
        if (typeof Entry !== 'undefined' && Entry.variableContainer?.variables_.find(v => v.getName().includes("[?우클릭]"))) {
            e.preventDefault();
        }
    });

    // 휠 이벤트
    window.addEventListener('wheel', (e) => {
        if (typeof Entry === 'undefined' || !Entry.variableContainer) return;
        const v = Entry.variableContainer.variables_.find(v => v.getName().trim() === "[?스크롤]");
        if (v) {
            lastWheelTime = Date.now();
            v.setValue(e.deltaY > 0 ? "DOWN" : "UP");
            if (Entry.requestUpdate) Entry.requestUpdate();
        }
    }, { passive: true });

    const coreLoop = () => {
        if (typeof Entry === 'undefined' || !Entry.variableContainer || !Entry.user) return;

        const vars = Entry.variableContainer.variables_;
        const canvas = document.querySelector('#entryCanvas') || document.querySelector('canvas');

        vars.forEach(v => {
            const n = v.getName().trim(); // 공백 제거 후 비교
            const val = v.getValue();

            if (n === "[?함수바나나]") {
                if (val !== "TRUE") v.setValue("TRUE");
            } 
            else if (n === "[?전체화면]") {
                const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
                const res = isFull ? "TRUE" : "FALSE";
                if (val !== res) v.setValue(res);
            } 
            else if (n === "[?운영체제]") {
                const os = navigator.platform.toLowerCase();
                let osName = os.includes("win") ? "WINDOWS" : os.includes("mac") ? "MACOS" : "LINUX";
                if (val !== osName) v.setValue(osName);
            } 
            else if (n === "[?스크롤]") {
                if (Date.now() - lastWheelTime > 150 && val !== "NONE") {
                    v.setValue("NONE");
                }
            } 
            else if (n === "[?우클릭]") {
                const rcStatus = isRightClick ? "TRUE" : "FALSE";
                if (val !== rcStatus) v.setValue(rcStatus);
            } 
            else if (n === "[?마우스 커서]") {
                if (val && val !== "NONE" && val !== 0 && canvas) {
                    canvas.style.cursor = `url("${val}"), auto`;
                }
            } 
            else if (n === "[?유저id]") {
                const uid = Entry.user._id || "GUEST";
                if (val !== uid) v.setValue(uid);
            } 
            else if (n === "[?화면 해상도]") {
                const res = canvas ? `${canvas.width}x${canvas.height}` : "0x00";
                if (val !== res) v.setValue(res);
            } 
            else if (n === "[?링크 열기]") {
                if (val !== "NONE" && val !== 0 && val !== "") {
                    let url = val;
                    if (!url.includes("playentry.org")) url = "https://playentry.org/redirect?external=" + encodeURIComponent(url);
                    window.open(url, '_blank');
                    v.setValue("NONE");
                }
            } 
            else if (n === "[?계정생성일자]") {
                const created = Entry.user.created || "unknown";
                if (val !== created) v.setValue(created);
            } 
            else if (n === "[?계정유형]") {
                const role = Entry.user.role || "member";
                if (val !== role) v.setValue(role);
            } 
            else if (n === "[?프로필id]") {
                const pimg = Entry.user.image || "none";
                if (val !== pimg) v.setValue(pimg);
            }
        });

        if (Entry.requestUpdate) Entry.requestUpdate();
    };

    setInterval(coreLoop, 100);
})();
