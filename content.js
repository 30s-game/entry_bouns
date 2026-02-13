(function() {
    let lastWheelTime = 0;
    let isRightClick = false;

    // 우클릭 상태 감지
    window.addEventListener('mousedown', (e) => { if (e.button === 2) isRightClick = true; });
    window.addEventListener('mouseup', (e) => { if (e.button === 2) isRightClick = false; });
    window.addEventListener('contextmenu', (e) => {
        if (typeof Entry !== 'undefined' && Entry.variableContainer?.variables_.some(v => v.getName().includes("우클릭"))) {
            e.preventDefault();
        }
    });

    // 휠 이벤트 - 시간 기록만 확실히
    window.addEventListener('wheel', (e) => {
        lastWheelTime = Date.now();
        window._lastScrollDir = e.deltaY > 0 ? "DOWN" : "UP";
    }, { passive: true });

    const coreLoop = () => {
        if (typeof Entry === 'undefined' || !Entry.variableContainer) return;

        const vars = Entry.variableContainer.variables_;
        const canvas = document.querySelector('#entryCanvas') || document.querySelector('canvas');
        const user = Entry.user || {};

        vars.forEach(v => {
            const n = v.getName();
            
            // 1. [?함수바나나]
            if (n.includes("함수바나나")) v.setValue("TRUE");

            // 2. [?전체화면]
            if (n.includes("전체화면")) {
                const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
                v.setValue(isFull ? "TRUE" : "FALSE");
            }

            // 3. [?운영체제]
            if (n.includes("운영체제")) {
                const os = navigator.platform.toLowerCase();
                v.setValue(os.includes("win") ? "WINDOWS" : os.includes("mac") ? "MACOS" : "LINUX");
            }

            // 4. [?스크롤] - 루프에서 시간 체크해서 NONE으로 강제 복귀
            if (n.includes("스크롤")) {
                if (Date.now() - lastWheelTime > 150) {
                    if (v.getValue() !== "NONE") v.setValue("NONE");
                } else {
                    if (v.getValue() !== window._lastScrollDir) v.setValue(window._lastScrollDir);
                }
            }

            // 5. [?우클릭]
            if (n.includes("우클릭")) v.setValue(isRightClick ? "TRUE" : "FALSE");

            // 6. [?마우스 커서]
            if (n.includes("마우스 커서")) {
                const url = v.getValue();
                if (url && url !== "NONE" && url !== 0 && canvas) canvas.style.cursor = `url("${url}"), auto`;
            }

            // 7. [?유저id]
            if (n.includes("유저id")) v.setValue(user._id || "GUEST");

            // 8. [?화면 해상도]
            if (n.includes("화면 해상도") && canvas) v.setValue(`${canvas.width}x${canvas.height}`);

            // 9. [?링크 열기]
            if (n.includes("링크 열기")) {
                const url = v.getValue();
                if (url && url !== "NONE" && url !== 0 && url !== "") {
                    let target = url.includes("playentry.org") ? url : "https://playentry.org/redirect?external=" + encodeURIComponent(url);
                    window.open(target, '_blank');
                    v.setValue("NONE");
                }
            }

            // 10. [?계정생성일자]
            if (n.includes("계정생성일자")) v.setValue(user.created || "unknown");

            // 11. [?계정유형]
            if (n.includes("계정유형")) v.setValue(user.role || "member");

            // 12. [?프로필id]
            if (n.includes("프로필id")) v.setValue(user.image || "none");
        });

        // 엔트리 화면 강제 갱신
        if (Entry.requestUpdate) Entry.requestUpdate();
    };

    // 0.05초마다 매우 빠르게 체크 (반응성 극대화)
    setInterval(coreLoop, 50;
})();
