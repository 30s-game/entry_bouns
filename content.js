(function() {
    let scrollTimer = null;
    let scene, camera, renderer;

    if (!window.THREE) {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        document.head.appendChild(s);
    }

    const initRenderer = () => {
        if (window._entry_ext_renderer) return;
        const canvas = document.querySelector('#entryCanvas') || document.querySelector('canvas');
        if (!canvas) return;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.domElement.style.cssText = `
            position: absolute; top: ${canvas.offsetTop}px; left: ${canvas.offsetLeft}px;
            pointer-events: none; z-index: 10;
        `;
        canvas.parentElement.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        window._entry_ext_renderer = renderer;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
    };

    // 스크롤 리스너 강화
    if (!window._has_scroll_ev) {
        window._has_scroll_ev = true;
        window.addEventListener('wheel', (e) => {
            if (typeof Entry === 'undefined' || !Entry.variableContainer) return;
            
            const vars = Entry.variableContainer.variables_;
            const scrollVar = vars.find(v => v.getName() === "[스크롤]");
            
            if (scrollVar) {
                // 1. 즉시 업/다운 반영
                const val = e.deltaY > 0 ? "down" : "up";
                scrollVar.setValue(val);
                if (Entry.requestUpdate) Entry.requestUpdate();

                // 2. 기존 타이머 제거 후 새로 생성
                if (scrollTimer) clearTimeout(scrollTimer);
                
                scrollTimer = setTimeout(() => {
                    // 타이머 안에서 변수를 다시 찾아서 0 주입 (안전장치)
                    const sVar = Entry.variableContainer.variables_.find(v => v.getName() === "[스크롤]");
                    if (sVar) {
                        sVar.setValue(0);
                        // 엔트리 엔진에 강제 업데이트 신호 전달
                        if (Entry.requestUpdate) Entry.requestUpdate();
                        if (typeof Entry.container === 'object') Entry.container.updateList(); 
                    }
                    scrollTimer = null;
                }, 100); // 0.1초로 살짝 단축해서 반응성 상향
            }
        }, { passive: true });
    }

    const coreLoop = () => {
        if (typeof Entry === 'undefined' || !Entry.variableContainer) return;

        initRenderer();

        if (!Entry.add_mesh) {
            Entry.add_mesh = function(type = 'cube', color = 0x00ff00) {
                const geo = type === 'sphere' ? new THREE.SphereGeometry(0.5, 32, 32) : new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshLambertMaterial({ color });
                const mesh = new THREE.Mesh(geo, mat);
                scene.add(mesh);
                return mesh;
            };
        }

        const vars = Entry.variableContainer.variables_;
        vars.forEach(v => {
            const n = v.getName();
            if (n === "{작품ID]") {
                if (v.getValue() !== Entry.projectId) v.setValue(Entry.projectId || "");
            }
            if (n === "[마우스x]") v.setValue(Entry.stage.mouseTickX);
            if (n === "[마우스y]") v.setValue(Entry.stage.mouseTickY);
        });

        if (Entry.requestUpdate) Entry.requestUpdate();
    };

    setInterval(coreLoop, 500);
})();
