const injectMagic = () => {
    let scrollTimer = null; // 휠 멈춤을 감지할 타이머

    setInterval(() => {
        if (typeof Entry !== 'undefined' && Entry.variableContainer) {
            const vars = Entry.variableContainer.variables_;
            
            vars.forEach(v => {
                const name = v.getName();

                // 1. [작품ID] 기능
                if (name === "[작품ID]") {
                    if (v.getValue() !== Entry.projectId) v.setValue(Entry.projectId || "none");
                }

                // 2. [스크롤] 기능 (개선됨!)
                if (name === "[스크롤]" && !window.magicScrollSet) {
                    window.magicScrollSet = true;
                    
                    window.addEventListener('wheel', (e) => {
                        // 휠을 굴리면 즉시 값 변경
                        const direction = e.deltaY > 0 ? "down" : "up";
                        v.setValue(direction);

                        // 기존에 돌아가던 '0으로 만들기' 타이머를 취소함
                        if (scrollTimer) clearTimeout(scrollTimer);

                        // 0.15초 동안 휠 입력이 없으면 0으로 초기화
                        scrollTimer = setTimeout(() => {
                            v.setValue(0);
                        }, 150); 
                    });
                }
            });
        }
    }, 500);
};

injectMagic();
