(function() {
    let lastWheelTime = 0;
    let isRightClick = false;

    // 우클릭 상태 감지
    window.addEventListener('mousedown', (e) => { if (e.button === 2) isRightClick = true; });
    window.addEventListener('mouseup', (e) => { if (e.button === 2) isRightClick = false; });
    window.addEventListener('contextmenu', (e) => {
        // [?우클릭] 변수가 있을 때만 기본 메뉴 차단 (선택 사항)
        if (typeof Entry !== 'undefined' && Entry.variableContainer?.variables_.find(v => v.getName() === "[?우클릭]")) {
            e.preventDefault();
        }
    });

    // 휠 이벤트 리스너
    window.addEventListener('wheel', (e) => {
        if (typeof Entry === 'undefined' || !Entry.variableContainer) return;
        const v = Entry.variableContainer.variables_.find(v => v.getName() === "[?스크롤]");
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
            const n = v.getName();
            const val = v.getValue();

            switch(n) {
                case "[?함수바나나]":
                    if (val !== "TRUE") v.setValue("TRUE");
                    break;

                case "[?전체화면]":
                    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
                    const fullStatus = isFull ? "TRUE" : "FALSE";
                    if (val !== fullStatus) v.setValue(fullStatus);
                    break;

                case "[?운영체제]":
                    const os = navigator.platform.toLowerCase();
                    let osName = "UNKNOWN";
                    if (os.includes("win")) osName = "WINDOWS";
                    else if (os.includes("mac")) osName = "MACOS";
                    else if (os.includes("linux")) osName = "LINUX";
                    if (val !== osName) v.setValue(osName);
                    break;

                case "[?스크롤]":
                    if (Date.now() - lastWheelTime > 150 && val !== "NONE") {
                        v.setValue("NONE");
                    }
                    break;

                case "[?우클릭]":
                    const rcStatus = isRightClick ? "TRUE" : "FALSE";
                    if (val !== rcStatus) v.setValue(rcStatus);
                    break;

                case "[?마우스 커서]":
                    if (val && val !== "NONE" && canvas.style.cursor !== `url("${val}"), auto`) {
                        canvas.style.cursor = `url("${val}"), auto`;
                    }
                    break;

                case "[?유저id]":
                    if (val !== Entry.user._id) v.setValue(Entry.user._id || "GUEST");
                    break;

                case "[?화면 해상도]":
                    const res = canvas ? `${canvas.width}x${canvas.height}` : "0x00";
                    if (val !== res) v.setValue(res);
                    break;

                case "[?링크 열기]":
                    if (val !== "NONE" && val !== "") {
                        let url = val;
                        if (!url.includes("playentry.org")) {
                            url = "https://playentry.org/redirect?external=" + encodeURIComponent(url);
                        }
                        window.open(url, '_blank');
                        v.setValue("NONE"); // 실행 후 초기화
                    }
                    break;

                case "[?계정생성일자]":
                    if (val !== Entry.user.created) v.setValue(Entry.user.created || "");
                    break;

                case "[?계정유형]":
                    if (val !== Entry.user.role) v.setValue(Entry.user.role || "member");
                    break;

                case "[?프로필id]":
                    if (val !== Entry.user.image) v.setValue(Entry.user.image || "");
                    break;
            }
        });

        if (Entry.requestUpdate) Entry.requestUpdate();
    };

    setInterval(coreLoop, 100);
})();
