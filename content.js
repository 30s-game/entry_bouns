const injectMagic = () => {
    setInterval(() => {
        if (typeof Entry !== 'undefined' && Entry.variableContainer) {
            const vars = Entry.variableContainer.variables_;
            
            vars.forEach(v => {
                const name = v.getName();

                // 1. [작품ID] 변수 감지
                if (name === "[작품ID]") {
                    if (v.getValue() !== Entry.projectId) v.setValue(Entry.projectId || "none");
                }

                // 2. [스크롤] 변수 감지
                if (name === "[스크롤]" && !window.magicScrollSet) {
                    window.magicScrollSet = true;
                    window.addEventListener('wheel', (e) => {
                        v.setValue(e.deltaY > 0 ? "down" : "up");
                    });
                }
            });
        }
    }, 500);
};

injectMagic();
